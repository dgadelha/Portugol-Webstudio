import { Directive, effect, ElementRef, inject, model, output, untracked } from "@angular/core";

/**
 * Um número decimal, com vírgula ou ponto e expoente opcional (`0,01`, `.5`, `1e-3`): sem o
 * hexadecimal e o `Infinity` que o `Number` também aceitaria.
 */
const DECIMAL = /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/**
 * A tolerância de um texto, ou `null` se ele não é uma. O texto vazio é a tolerância padrão.
 */
function parseTolerance(text: string): { value: number | undefined } | null {
  const trimmed = text.trim().replace(",", ".");

  if (trimmed === "") {
    return { value: undefined };
  }

  // `1e400` passa pela forma, mas vira `Infinity`
  const value = Number(trimmed);

  return DECIMAL.test(trimmed) && Number.isFinite(value) ? { value } : null;
}

function format(tolerance: number | undefined) {
  return tolerance === undefined ? "" : String(tolerance);
}

/**
 * O campo da tolerância de uma verificação. Um número vale assim que é digitado, e o campo
 * nunca é reescrito enquanto tem o foco (como em `1e-3`, que passa por `1e`). Um texto que não
 * é número nunca é guardado: ao sair do campo (ou com o Enter), ele volta ao último número
 * confirmado, e `rejected` avisa o texto recusado, para quem usa o campo dizer por quê.
 */
@Directive({
  selector: "input[appToleranceInput]",
  host: { "(input)": "onInput()", "(change)": "onChange()", "(blur)": "sync()" },
})
export class ToleranceInputDirective {
  private element = inject<ElementRef<HTMLInputElement>>(ElementRef);

  /**
   * A tolerância guardada; `undefined` é a padrão.
   */
  readonly tolerance = model<number | undefined>();

  /**
   * O texto recusado, depois que o campo voltou ao valor de antes.
   */
  readonly rejected = output<string>();

  /**
   * O último número confirmado (ao sair do campo ou com o Enter) ou vindo de fora: o valor de
   * volta de um texto recusado.
   */
  private confirmed: number | undefined;

  /**
   * O número digitado e ainda não confirmado, que já vale como a tolerância. Uma tolerância
   * diferente dele veio de fora.
   */
  private typed: { value: number | undefined } | null = null;

  constructor() {
    // O que vem de fora (outro caso no mesmo lugar, um arquivo aberto, as respostas geradas)
    // passa a ser o valor confirmado e reescreve o campo, menos enquanto alguém digita nele
    effect(() => {
      const tolerance = this.tolerance();

      untracked(() => {
        // Sem nada digitado, a tolerância veio de fora mesmo quando é a padrão (`undefined`)
        if (this.typed === null || this.typed.value !== tolerance) {
          this.confirmed = tolerance;
          this.typed = null;
        }

        this.sync();
      });
    });
  }

  /**
   * Mostra a tolerância guardada, menos com o foco no campo. Ao sair dele, mostra também o que
   * mudou de fora enquanto se digitava.
   */
  sync() {
    const field = this.element.nativeElement;

    if (field === document.activeElement) {
      return;
    }

    const tolerance = this.tolerance();
    // `1e-3` continua `1e-3`, em vez de virar `0.001`
    const shown = parseTolerance(field.value);

    if (!shown || shown.value !== tolerance) {
      field.value = format(tolerance);
    }
  }

  onInput() {
    const parsed = parseTolerance(this.element.nativeElement.value);

    if (parsed && parsed.value !== this.tolerance()) {
      this.typed = { value: parsed.value };
      this.tolerance.set(parsed.value);
    }
  }

  /**
   * Ao sair do campo (ou com o Enter): um texto que não é número é recusado.
   */
  onChange() {
    const field = this.element.nativeElement;
    const text = field.value;

    const parsed = parseTolerance(text);

    this.typed = null;

    if (parsed) {
      // O número digitado já é a tolerância, a menos que ela tenha mudado de fora enquanto se
      // digitava: aí vale a de fora, que o campo mostra ao perder o foco
      this.confirmed = this.tolerance();
      return;
    }

    field.value = format(this.confirmed);

    if (this.tolerance() !== this.confirmed) {
      this.tolerance.set(this.confirmed);
    }

    this.rejected.emit(text);
  }
}
