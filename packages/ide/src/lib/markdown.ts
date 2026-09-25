import { Marked } from "marked";

const marked = new Marked({
  async: false,
  gfm: true,
  hooks: {
    // Links externos abrem em outra aba do navegador, sem tirar o usuário do IDE.
    postprocess: html =>
      html.replaceAll(/<a href="(https?:\/\/)/g, '<a target="_blank" rel="external noreferrer noopener nofollow" href="$1'),
  },
});

/**
 * Converte Markdown do próprio projeto (changelog e documentação das bibliotecas) em HTML.
 * O conteúdo é confiável: vem do repositório, não do usuário.
 */
export function renderMarkdown(source: string) {
  return marked.parse(source) as string;
}
