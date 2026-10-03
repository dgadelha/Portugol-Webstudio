import {
  ConnectedPosition,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  OverlayRef,
} from "@angular/cdk/overlay";
import { AriaDescriber } from "@angular/cdk/a11y";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  signal,
} from "@angular/core";

type TooltipPosition = "above" | "below" | "left" | "right";

const POSITIONS: Record<TooltipPosition, ConnectedPosition[]> = {
  above: [
    { originX: "center", originY: "top", overlayX: "center", overlayY: "bottom", offsetY: -6 },
    { originX: "center", originY: "bottom", overlayX: "center", overlayY: "top", offsetY: 6 },
  ],
  below: [
    { originX: "center", originY: "bottom", overlayX: "center", overlayY: "top", offsetY: 6 },
    { originX: "center", originY: "top", overlayX: "center", overlayY: "bottom", offsetY: -6 },
  ],
  right: [
    { originX: "end", originY: "center", overlayX: "start", overlayY: "center", offsetX: 6 },
    { originX: "start", originY: "center", overlayX: "end", overlayY: "center", offsetX: -6 },
  ],
  left: [
    { originX: "start", originY: "center", overlayX: "end", overlayY: "center", offsetX: -6 },
    { originX: "end", originY: "center", overlayX: "start", overlayY: "center", offsetX: 6 },
  ],
};

/**
 * Espera antes de mostrar a dica ao passar o mouse, para ela não piscar quando
 * o ponteiro só atravessa o botão.
 */
const HOVER_DELAY = 500;

/**
 * Espera antes de esconder a dica quando o ponteiro sai do controle, tempo de
 * ele atravessar o espaço até a dica (WCAG 1.4.13).
 */
const LEAVE_DELAY = 150;

@Component({
  selector: "app-tooltip",
  templateUrl: "./tooltip.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "pws-tooltip", role: "tooltip" },
})
class TooltipComponent {
  readonly text = signal("");
  readonly shortcut = signal("");
}

/**
 * Dica visual de um controle, como as do VS Code. Aparece ao passar o mouse e
 * também ao focar pelo teclado, continua aberta com o ponteiro sobre ela e
 * some com Esc (WCAG 1.4.13).
 *
 * Para leitores de tela, a dica vira a descrição do controle quando diz algo
 * além do nome dele (que vem do `aria-label` ou do próprio texto), como a ação
 * de "Ln 3, Col 25". O atalho de teclado (`appTooltipShortcut`) aparece na dica
 * com outra fonte e também entra na descrição.
 */
@Directive({
  selector: "[appTooltip]",
  host: {
    "(mouseenter)": "show(true)",
    "(mouseleave)": "scheduleHide()",
    "(focusin)": "onFocus()",
    "(focusout)": "hide()",
    "(click)": "hide()",
  },
})
export class TooltipDirective implements OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly ariaDescriber = inject(AriaDescriber);

  readonly appTooltip = input.required<string>();
  readonly appTooltipPosition = input<TooltipPosition>("below");
  readonly appTooltipShortcut = input<string>("");

  constructor() {
    // Depois da renderização, quando o `aria-label` do controle já está no DOM.
    afterRenderEffect(onCleanup => {
      const description = this.description();

      if (!description) {
        return;
      }

      this.ariaDescriber.describe(this.element.nativeElement, description);
      onCleanup(() => {
        this.ariaDescriber.removeDescription(this.element.nativeElement, description);
      });
    });
  }

  private overlayRef?: OverlayRef;
  private timer?: ReturnType<typeof setTimeout>;

  /**
   * Esc fecha a dica mesmo quando ela veio do mouse e o foco está em outro
   * lugar (WCAG 1.4.13).
   */
  private readonly onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.hide();
    }
  };

  onFocus() {
    // Só o foco que vem do teclado mostra a dica; um clique também foca o botão.
    if (this.element.nativeElement.matches(":focus-visible")) {
      this.show(false);
    }
  }

  show(delayed: boolean) {
    clearTimeout(this.timer);

    if (!this.appTooltip()) {
      return;
    }

    if (delayed) {
      this.timer = setTimeout(() => {
        this.attach();
      }, HOVER_DELAY);
    } else {
      this.attach();
    }
  }

  scheduleHide() {
    clearTimeout(this.timer);

    if (this.overlayRef?.hasAttached()) {
      this.timer = setTimeout(() => {
        this.hide();
      }, LEAVE_DELAY);
    }
  }

  hide() {
    clearTimeout(this.timer);
    this.overlayRef?.detach();
    document.removeEventListener("keydown", this.onDocumentKeydown, { capture: true });
  }

  ngOnDestroy() {
    this.hide();
    this.overlayRef?.dispose();
  }

  /**
   * O texto da dica, se não repetir o nome do controle, e o atalho.
   */
  private description() {
    const text = this.appTooltip();
    const shortcut = this.appTooltipShortcut();
    const element = this.element.nativeElement;
    const name = this.normalize(element.getAttribute("aria-label") ?? element.textContent ?? "");
    const parts = [];

    if (text && !name.includes(this.normalize(text))) {
      parts.push(text);
    }

    if (shortcut) {
      parts.push(`Atalho: ${shortcut}`);
    }

    return parts.join(". ");
  }

  /**
   * Para comparar a dica com o nome: "Salvar como…" e "Salvar como" são iguais.
   */
  private normalize(text: string) {
    return text.replaceAll("…", "").replaceAll(/\s+/g, " ").trim().toLowerCase();
  }

  private attach() {
    this.overlayRef ??= createOverlayRef(this.injector, {
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, this.element)
        .withPositions(POSITIONS[this.appTooltipPosition()])
        .withPush(true)
        .withViewportMargin(4),
    });

    if (this.overlayRef.hasAttached()) {
      return;
    }

    const ref = this.overlayRef.attach(new ComponentPortal(TooltipComponent));
    ref.instance.text.set(this.appTooltip());
    ref.instance.shortcut.set(this.appTooltipShortcut());

    // Com o ponteiro sobre a dica, ela continua aberta, para quem usa lupa ler.
    const tooltip = ref.location.nativeElement as HTMLElement;

    tooltip.addEventListener("mouseenter", () => {
      clearTimeout(this.timer);
    });
    tooltip.addEventListener("mouseleave", () => {
      this.scheduleHide();
    });
    document.addEventListener("keydown", this.onDocumentKeydown, { capture: true });
  }
}
