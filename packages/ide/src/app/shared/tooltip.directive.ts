import {
  ConnectedPosition,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  OverlayRef,
} from "@angular/cdk/overlay";
import { AriaDescriber } from "@angular/cdk/a11y";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  effect,
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
 * também ao focar pelo teclado, some com Esc (WCAG 1.4.13) e não repete o nome
 * do controle para leitores de tela: quem usa um deve dar o nome ao controle
 * com `aria-label` ou com o próprio texto.
 *
 * O atalho de teclado (`appTooltipShortcut`) aparece na dica com outra fonte e
 * também chega aos leitores de tela, como descrição do controle.
 */
@Directive({
  selector: "[appTooltip]",
  host: {
    "(mouseenter)": "show(true)",
    "(mouseleave)": "hide()",
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
    effect(onCleanup => {
      const shortcut = this.appTooltipShortcut();

      if (!shortcut) {
        return;
      }

      const description = `Atalho: ${shortcut}`;

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

  hide() {
    clearTimeout(this.timer);
    this.overlayRef?.detach();
    document.removeEventListener("keydown", this.onDocumentKeydown, { capture: true });
  }

  ngOnDestroy() {
    this.hide();
    this.overlayRef?.dispose();
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
    document.addEventListener("keydown", this.onDocumentKeydown, { capture: true });
  }
}
