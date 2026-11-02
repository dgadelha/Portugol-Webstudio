import { Directive, effect, ElementRef, inject, input } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";

import { MonacoService } from "../monaco.service";
import { Theme, ThemeService } from "../theme.service";

/**
 * Um trecho curto de Portugol, colorido como no editor: `<code [appPortugol]="texto"></code>`.
 * Usado nos valores dos exercícios (`real 12.0`, `cadeia "Área: "`), que também são Portugol
 * válido. Até o Monaco carregar, mostra o texto sem cores; o leitor de tela lê o mesmo texto.
 *
 * O Monaco escreve cada espaço como um espaço não separável (U+00A0): eles voltam a ser espaços
 * comuns, para o valor copiado sair como no código, e o `white-space: pre-wrap` mantém os
 * espaços seguidos de uma cadeia, como em `cadeia "a  b"`.
 */
@Directive({ selector: "[appPortugol]", host: { "[style.white-space]": "'pre-wrap'" } })
export class PortugolCodeDirective {
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private monacoService = inject(MonacoService);
  private themeService = inject(ThemeService);

  readonly appPortugol = input.required<string>();

  /**
   * As cores vêm das classes do tema do Monaco (`mtk1`…), que mudam de um tema para outro: o
   * trecho é colorido de novo quando o tema muda.
   */
  private readonly theme = toSignal(this.themeService.theme$, {
    initialValue: (document.body.dataset["theme"] as Theme | undefined) ?? "dark",
  });

  constructor() {
    effect(onCleanup => {
      const text = this.appPortugol();
      const theme = this.theme();
      const element = this.element.nativeElement;
      let current = true;

      onCleanup(() => {
        current = false;
      });

      if (element.textContent !== text) {
        element.textContent = text;
      }

      void this.colorize(text, theme).then(html => {
        if (current && html !== undefined) {
          // HTML gerado pelo Monaco a partir do texto, com o texto escapado
          // eslint-disable-next-line unicorn/no-unsafe-dom-html
          element.innerHTML = html;
        }
      });
    });
  }

  private async colorize(text: string, theme: Theme) {
    try {
      await this.monacoService.ready;
      monaco.editor.setTheme(`portugol-${theme}`);

      // O Monaco termina cada linha com um <br/>: num trecho de uma linha, ele quebraria o texto
      return (await monaco.editor.colorize(text, "portugol", {}))
        .replace(/(?:<br\s*\/?>)+$/, "")
        .replaceAll(/\u{A0}|&#160;|&nbsp;/gu, " ");
    } catch {
      // Sem o Monaco, o texto fica sem cores
      return;
    }
  }
}
