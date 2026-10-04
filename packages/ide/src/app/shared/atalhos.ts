const EDITÁVEIS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * O atalho de teclado de um `keydown` ouvido no `document`, como "ctrl+s",
 * "alt+n" ou "f1", ou `undefined` quando o evento não deve virar atalho:
 *
 * - quando alguém já o tratou: o editor de código tem os próprios atalhos
 *   (Ctrl+Enter, Ctrl+S…) e consome o evento;
 * - quando vem de um campo de texto (os campos do Monaco também são
 *   `<textarea>`), em que as teclas são do campo;
 * - quando vem de um diálogo ou menu, que ficam por cima do IDE.
 */
export function atalhoDoEvento(event: KeyboardEvent): string | undefined {
  const alvo = event.target as HTMLElement;

  if (
    event.defaultPrevented ||
    EDITÁVEIS.has(alvo.nodeName) ||
    alvo.isContentEditable ||
    alvo.closest(".cdk-overlay-container")
  ) {
    return undefined;
  }

  if (event.metaKey || event.shiftKey || (event.ctrlKey && event.altKey)) {
    return undefined;
  }

  if (event.altKey) {
    // Com o Alt, o `key` pode ser outro caractere (no Mac, Option+N digita "˜"):
    // a letra vem da tecla física
    const letra = /^Key[A-Z]$/.test(event.code) ? event.code.slice(3).toLowerCase() : event.key.toLowerCase();

    return `alt+${letra}`;
  }

  const tecla = event.key.toLowerCase();

  return event.ctrlKey ? `ctrl+${tecla}` : tecla;
}
