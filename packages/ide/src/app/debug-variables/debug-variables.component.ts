import { LiveAnnouncer } from "@angular/cdk/a11y";
import { NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
} from "@angular/core";
import type { DebugPause, DebugVariable } from "@portugol-webstudio/runner";
import { AngularSvgIconModule } from "angular-svg-icon";
import { GoogleAnalyticsService } from "ngx-google-analytics";

import { TooltipDirective } from "../shared/tooltip.directive";

import {
  baseType,
  declarationText,
  dimensions,
  previousFrameVariables,
  summaryText,
  valueText,
  variableChanges,
} from "./debug-values";

/**
 * A aba "Variáveis" do painel durante a depuração: as chamadas de função em andamento
 * e as variáveis da chamada escolhida e as globais, com o que mudou desde a última
 * pausa destacado. Cada variável aparece como a linha que a declara, com o valor de
 * agora: `real soma = 15.5`.
 */
@Component({
  selector: "app-debug-variables",
  imports: [AngularSvgIconModule, NgTemplateOutlet, TooltipDirective],
  templateUrl: "./debug-variables.component.html",
  styleUrl: "./debug-variables.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebugVariablesComponent {
  private announcer = inject(LiveAnnouncer);
  private gaService = inject(GoogleAnalyticsService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private injector = inject(Injector);

  constructor() {
    // Com o foco numa chamada que terminou, o botão dela some e o foco iria para a página:
    // ele vai para a chamada de agora, a primeira da lista
    effect(() => {
      this.pause();

      const list = this.host.nativeElement.querySelector(".frame-list");

      if (!list?.contains(document.activeElement)) {
        return;
      }

      afterNextRender(
        () => {
          if (!list.isConnected || !list.contains(document.activeElement)) {
            this.host.nativeElement.querySelector<HTMLElement>(".frame")?.focus();
          }
        },
        { injector: this.injector },
      );
    });
  }

  /**
   * A pausa atual, ou `null` com o programa executando ou sem depuração.
   */
  readonly pause = input<DebugPause | null>(null);

  /**
   * A pausa anterior da mesma depuração, para destacar o que mudou.
   */
  readonly previousPause = input<DebugPause | null>(null);

  readonly debugging = input(false);

  /**
   * Todas as abas de código ficam montadas: os `id`s dos títulos levam o da aba.
   */
  /**
   * A chamada escolhida na lista; a mais recente, a cada pausa nova.
   */
  readonly selectedFrame = linkedSignal({ source: this.pause, computation: () => 0 });

  /**
   * Os vetores e matrizes abertos, pela lista e pelo nome (`locals:v`, `globals:v`: uma variável
   * local pode ocultar uma global com o mesmo nome). Continuam abertos de uma pausa para a outra,
   * e só os abertos mostram cada posição (um vetor fechado não cria um elemento por item).
   */
  readonly opened = signal(new Set<string>());

  readonly frame = computed(() => this.pause()?.frames[this.selectedFrame()] ?? null);

  readonly changedLocals = computed(() => {
    const pause = this.pause();
    const index = this.selectedFrame();

    return this.changedNames(
      this.frame()?.variables ?? [],
      pause ? previousFrameVariables(pause, this.previousPause(), index) : null,
    );
  });

  readonly changedGlobals = computed(() =>
    this.changedNames(this.pause()?.globals ?? [], this.previousPause()?.globals ?? null),
  );

  readonly baseType = baseType;
  readonly dimensions = dimensions;
  readonly summaryText = summaryText;
  readonly valueText = valueText;

  /**
   * A variável copiada há pouco, que mostra um ✓ no lugar do botão de copiar.
   */
  readonly copied = signal<DebugVariable | null>(null);

  /**
   * Copia a declaração com o valor inteiro, que dá para colar num programa.
   */
  async copy(variable: DebugVariable) {
    try {
      await navigator.clipboard.writeText(declarationText(variable));
    } catch (error) {
      console.error(error);
      this.gaService.event("debug_copy_variable", "Depuração", "erro");
      void this.announcer.announce("Não foi possível copiar.", "polite");
      return;
    }

    this.gaService.event("debug_copy_variable", "Depuração", "ok");
    this.copied.set(variable);
    void this.announcer.announce(`Declaração de ${variable.name} copiada.`, "polite");

    setTimeout(() => {
      if (this.copied() === variable) {
        this.copied.set(null);
      }
    }, 1500);
  }

  selectFrame(index: number) {
    this.gaService.event("debug_select_frame", "Depuração", index === 0 ? "atual" : "anterior");
    this.selectedFrame.set(index);
  }

  onToggle(key: string, event: Event) {
    const open = (event.target as HTMLDetailsElement).open;

    this.opened.update(opened => {
      const next = new Set(opened);

      if (open) {
        next.add(key);
      } else {
        next.delete(key);
      }

      return next;
    });
  }

  private changedNames(variables: DebugVariable[], previous: DebugVariable[] | null) {
    return new Set(variableChanges(variables, previous).map(change => change.variable.name));
  }
}
