import { Directive, effect, ElementRef, inject, model, signal } from "@angular/core";

/**
 * O campo da tolerância de uma verificação. O texto digitado é de quem digita: o campo nunca é
 * reescrito no meio da digitação (como em `1e-3`, que passa por `1e`), e um texto que não é um
 * número fica no campo, marcado como inválido, em vez de sumir. Só uma tolerância que mudou por
 * fora (um arquivo aberto, um caso removido) é escrita de novo no campo.
 */
@Directive({
  selector: "input[appToleranceInput]",
  host: { "(input)": "onInput()" },
  exportAs: "appToleranceInput",
})
export class ToleranceInputDirective {
  private element = inject<ElementRef<HTMLInputElement>>(ElementRef);

  /**
   * A tolerância guardada; `undefined` é a padrão.
   */
  readonly tolerance = model<number | undefined>();

  /**
   * O texto do campo não é um número maior ou igual a zero.
   */
  readonly invalid = signal(false);

  /**
   * O último valor que saiu deste campo: a tolerância que voltar igual a ele não reescreve o
   * texto. Começa diferente de qualquer valor, para o campo mostrar a tolerância inicial.
   */
  private emitted: number | undefined | null = null;

  constructor() {
    effect(() => {
      const tolerance = this.tolerance();

      if (tolerance !== this.emitted) {
        this.element.nativeElement.value = tolerance === undefined ? "" : String(tolerance);
        this.emitted = tolerance;
        this.invalid.set(false);
      }
    });
  }

  onInput() {
    const text = this.element.nativeElement.value.trim();
    const value = Number(text.replace(",", "."));
    const valid = text === "" || (Number.isFinite(value) && value >= 0);

    this.invalid.set(!valid);
    this.emitted = text !== "" && valid ? value : undefined;
    this.tolerance.set(this.emitted);
  }
}
