/**
 * O texto com os caracteres especiais do HTML escapados, para entrar no HTML como texto. Usado
 * pela Ajuda e pelo enunciado dos exercícios.
 */
export function escapeHtml(text: string) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/**
 * Cada tabela fica numa caixa que rola na horizontal, como a `.table-responsive` do Bootstrap:
 * numa tela estreita, só a tabela rola, e não a página toda. A aba de ajuda torna a caixa
 * alcançável pelo teclado quando a tabela não cabe nela. As tabelas do Markdown não se
 * aninham, e o `<table>` dentro de um código chega aqui escapado.
 */
export function wrapTables(html: string) {
  return html.replaceAll("<table>", '<div class="tabela"><table>').replaceAll("</table>", "</table></div>");
}

/**
 * O aviso, só para os leitores de tela, de que o link abre em outra aba do navegador, como nos
 * links fora do Markdown. Não aparece na tela nem entra no que se copia. Os templates escrevem o
 * mesmo texto à mão, num `<span class="visually-hidden">`: se mudar aqui, mude lá.
 */
export const NEW_TAB_HINT = " (abre em outra aba)";

/**
 * Os links para fora do IDE abrem em outra aba do navegador, sem tirar o usuário do IDE, e
 * avisam isso ao leitor de tela. Os links do Markdown não se aninham.
 */
export function openExternalLinksInNewTab(html: string) {
  return html.replaceAll(
    /<a href="(https?:\/\/[^"]*)"([^>]*)>([\s\S]*?)<\/a>/g,
    `<a target="_blank" rel="external noreferrer noopener nofollow" href="$1"$2>$3<span class="visually-hidden">${NEW_TAB_HINT}</span></a>`,
  );
}
