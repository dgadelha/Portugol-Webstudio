import { useEffect, useRef } from "react";

export type HotkeyMap = Record<string, (event: KeyboardEvent) => void>;

interface ParsedHotkey {
  mod: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
}

/**
 * `"mod+s"`, `"mod+enter"`, `"f1"`… `mod` é Ctrl, ou Cmd no macOS.
 */
function parseHotkey(combo: string): ParsedHotkey {
  const parts = combo.toLowerCase().split("+").map(part => part.trim());

  return {
    mod: parts.includes("mod"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
    key: parts.at(-1) ?? "",
  };
}

function matches(event: KeyboardEvent, hotkey: ParsedHotkey) {
  return (
    (event.ctrlKey || event.metaKey) === hotkey.mod &&
    event.shiftKey === hotkey.shift &&
    event.altKey === hotkey.alt &&
    event.key.toLowerCase() === hotkey.key
  );
}

/**
 * Atalhos globais da janela. Os handlers podem mudar a cada render sem reinstalar o listener.
 */
export function useHotkeys(hotkeys: HotkeyMap, enabled = true) {
  const handlers = useRef(hotkeys);

  useEffect(() => {
    handlers.current = hotkeys;
  });

  const combos = Object.keys(hotkeys).join("|");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const parsed = combos.split("|").map(combo => [combo, parseHotkey(combo)] as const);

    const onKeyDown = (event: KeyboardEvent) => {
      // Já tratado por quem tem o foco (o Monaco, por exemplo, tem as mesmas ações).
      if (event.defaultPrevented) {
        return;
      }

      for (const [combo, hotkey] of parsed) {
        if (matches(event, hotkey)) {
          event.preventDefault();
          handlers.current[combo]?.(event);
          return;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [combos, enabled]);
}
