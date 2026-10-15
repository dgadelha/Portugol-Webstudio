import { isMacintosh } from "../../settings";

const EDITÁVEIS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * O atalho de teclado de um `keydown` ouvido no `document`, como "ctrl+s",
 * "alt+n" ou "f1", ou `undefined` quando o evento não deve virar atalho:
 *
 * - quando alguém já o tratou: o editor de código tem os próprios atalhos
 *   (Ctrl+Enter, Ctrl+S…) e consome o evento;
 * - quando vem de um campo de texto ou de um editor do Monaco, em que as teclas são
 *   do campo (no Chrome, o Monaco recebe o texto num `<div>` com o `EditContext`, e não
 *   num `<textarea>`): o editor de código registra os atalhos que valem nele;
 * - quando vem de um diálogo ou menu, que ficam por cima do IDE.
 */
export function atalhoDoEvento(event: KeyboardEvent): string | undefined {
  const alvo = event.target as HTMLElement;

  if (
    event.defaultPrevented ||
    EDITÁVEIS.has(alvo.nodeName) ||
    alvo.isContentEditable ||
    alvo.closest(".monaco-editor") ||
    alvo.closest(".cdk-overlay-container")
  ) {
    return undefined;
  }

  if (event.ctrlKey && event.altKey) {
    return undefined;
  }

  // No Mac, o Cmd faz o papel do Ctrl, como no editor de código: Cmd+S é o "ctrl+s"
  if (event.metaKey) {
    return isMacintosh && !event.ctrlKey && !event.altKey && !event.shiftKey
      ? `ctrl+${event.key.toLowerCase()}`
      : undefined;
  }

  // Com o Shift, só as teclas de função, como o Shift+F5 do Parar: com as letras, o Shift
  // digita maiúsculas
  if (event.shiftKey) {
    return !event.ctrlKey && !event.altKey && /^F\d{1,2}$/.test(event.key)
      ? `shift+${event.key.toLowerCase()}`
      : undefined;
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
