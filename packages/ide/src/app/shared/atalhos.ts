import { isMacintosh } from "../../settings";

const EDITÁVEIS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * O atalho de teclado de um `keydown` ouvido no `document`, como "ctrl+s",
 * "alt+n" ou "f1", ou `undefined` quando o evento não deve virar atalho:
 *
 * - quando alguém já o tratou: os editores de código e de saída têm os próprios atalhos
 *   (Ctrl+Enter, Ctrl+S…, em `TabEditorComponent.initShortcuts`) e consomem o evento;
 * - quando vem de um campo de texto ou de um editor do Monaco, em que as teclas são
 *   do campo (no Chrome, o Monaco recebe o texto num `<div>` com o `EditContext`, e não
 *   num `<textarea>`), menos o F1 e o Ctrl+O (`valeNoCampo`);
 * - quando vem de um diálogo ou menu, que ficam por cima do IDE.
 */
export function atalhoDoEvento(event: KeyboardEvent): string | undefined {
  const alvo = event.target as HTMLElement;

  if (event.defaultPrevented || alvo.closest(".cdk-overlay-container")) {
    return undefined;
  }

  const atalho = atalhoDaTecla(event);
  const numCampo = EDITÁVEIS.has(alvo.nodeName) || alvo.isContentEditable || alvo.closest(".monaco-editor");

  return !numCampo || valeNoCampo(atalho, event) ? atalho : undefined;
}

/**
 * Se o atalho vale também com o foco num campo de texto ou num editor do Monaco: só o F1 e o
 * Ctrl+O, que não digitam nada.
 */
function valeNoCampo(atalho: string | undefined, event: KeyboardEvent) {
  switch (atalho) {
    case "f1": {
      return true;
    }

    // No Mac, o Ctrl+O é do campo, que insere uma linha, como o Monaco: só o Cmd+O abre arquivos
    case "ctrl+o": {
      return !isMacintosh || event.metaKey;
    }

    default: {
      return false;
    }
  }
}

function atalhoDaTecla(event: KeyboardEvent): string | undefined {
  if (event.ctrlKey && event.altKey) {
    return undefined;
  }

  // O Ctrl+Shift+Enter do Verificar, nos exercícios (no Mac, Cmd+Shift+Enter)
  if (
    event.key === "Enter" &&
    event.shiftKey &&
    !event.altKey &&
    (isMacintosh ? event.metaKey !== event.ctrlKey : event.ctrlKey && !event.metaKey)
  ) {
    return "ctrl+shift+enter";
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
