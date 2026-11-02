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
