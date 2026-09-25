import { memoryStorage, usableStorage } from "@/lib/browserStorage";

// https://github.com/microsoft/vscode/blob/1fe7285a1162756215a684ee702b16d0ce42bdb4/src/vs/editor/common/config/fontInfo.ts#L240
export const DEFAULT_FONT_SIZE = navigator.userAgent.includes("Macintosh") ? 12 : 14;

export const FONT_SIZE_RANGE = { min: 6, max: 48 };

interface Setting<T> {
  default: T;
  /**
   * Converte o que está guardado — `null` quando a configuração nunca foi alterada — num valor
   * válido, ou no padrão.
   */
  parse(value: unknown): T;
}

function boolean(defaultValue: boolean): Setting<boolean> {
  return { default: defaultValue, parse: value => (typeof value === "boolean" ? value : defaultValue) };
}

/**
 * Um inteiro entre `min` e `max`, inclusive. Fora da faixa — ou `NaN`, `Infinity`, `null` — vale o
 * padrão.
 */
function integer<T extends number | null>(
  defaultValue: T,
  { min, max }: { min: number; max: number },
): Setting<number | T> {
  return {
    default: defaultValue,
    parse: value => {
      const number = typeof value === "string" ? Number(value) : value;

      return typeof number === "number" && Number.isSafeInteger(number) && number >= min && number <= max
        ? number
        : defaultValue;
    },
  };
}

function oneOf<const T extends string>(values: readonly T[], defaultValue: T): Setting<T> {
  return {
    default: defaultValue,
    parse: value => values.find(option => option === value) ?? defaultValue,
  };
}

/**
 * Todas as configurações do IDE: o padrão e os valores aceitos de cada uma ficam só aqui.
 */
const SETTINGS = {
  theme: oneOf(["auto", "light", "dark"], "auto"),
  editorFontSize: integer(DEFAULT_FONT_SIZE, FONT_SIZE_RANGE),
  editorWordWrap: boolean(false),
  editorTabSize: integer(2, { min: 1, max: 8 }),
  editorInsertSpaces: boolean(true),
  editorLineNumbers: oneOf(["on", "relative", "off"], "on"),
  editorMinimap: boolean(true),
  editorBracketPairColorization: boolean(true),
  editorIndentationGuides: boolean(true),
  editorRenderWhitespace: oneOf(["none", "selection", "all"], "selection"),
  editorAutoClosing: boolean(true),
  editorCursorStyle: oneOf(["line", "block", "underline"], "line"),
  // Sem valor, acompanha o tamanho da fonte do editor.
  outputFontSize: integer(null, FONT_SIZE_RANGE),
  outputClearOnRun: boolean(true),
  outputAutoScroll: boolean(true),
};

type SettingValue<S> = S extends Setting<infer T> ? T : never;

export type Settings = { [K in keyof typeof SETTINGS]: SettingValue<(typeof SETTINGS)[K]> };

export type ThemePreference = Settings["theme"];
export type EditorLineNumbers = Settings["editorLineNumbers"];
export type EditorRenderWhitespace = Settings["editorRenderWhitespace"];
export type EditorCursorStyle = Settings["editorCursorStyle"];

const SETTING_NAMES = Object.keys(SETTINGS) as Array<keyof Settings>;

/**
 * Mesmas chaves que a versão anterior do IDE gravava (prefixo `pws:`, em minúsculas e em JSON),
 * para que as preferências de quem já usa o site continuem valendo.
 */
function storageKey(name: keyof Settings) {
  return `pws:${name.toLowerCase()}`;
}

function parseStored(raw: string | null): unknown {
  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/**
 * Preferências do usuário, com a mesma interface de `useSyncExternalStore`.
 * Mudanças feitas em outra aba do navegador chegam pelo evento `storage`.
 */
class SettingsStore {
  private readonly storage = usableStorage(() => localStorage) ?? memoryStorage();
  private readonly listeners = new Set<() => void>();
  private snapshot: Settings = this.read();

  private read(): Settings {
    return Object.fromEntries(
      SETTING_NAMES.map(name => [name, SETTINGS[name].parse(parseStored(this.storage.getItem(storageKey(name))))]),
    ) as Settings;
  }

  private refresh() {
    this.snapshot = this.read();

    for (const listener of this.listeners) {
      listener();
    }
  }

  private readonly onStorage = (event: StorageEvent) => {
    if (event.key === null || SETTING_NAMES.some(name => storageKey(name) === event.key)) {
      this.refresh();
    }
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    if (this.listeners.size === 1) {
      window.addEventListener("storage", this.onStorage);
    }

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === 0) {
        window.removeEventListener("storage", this.onStorage);
      }
    };
  };

  getSnapshot = () => this.snapshot;

  set<K extends keyof Settings>(key: K, value: Settings[K]) {
    try {
      this.storage.setItem(storageKey(key), JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to persist setting", key, error);
    }

    this.refresh();
  }

  /**
   * Só as configurações voltam ao padrão: o código em edição, no mesmo storage, fica intacto.
   */
  reset() {
    for (const name of SETTING_NAMES) {
      try {
        this.storage.removeItem(storageKey(name));
      } catch {
        // A chave já é inacessível.
      }
    }

    this.refresh();
  }

  /**
   * Um nível de indentação, do jeito que o editor está configurado agora.
   */
  editorIndentation() {
    const { editorInsertSpaces, editorTabSize } = this.snapshot;

    return editorInsertSpaces ? " ".repeat(editorTabSize) : "\t";
  }
}

export const settingsStore = new SettingsStore();

/**
 * Até ser alterado, o tamanho da fonte da saída acompanha o do editor.
 */
export function outputFontSize(settings: Settings) {
  return settings.outputFontSize ?? settings.editorFontSize;
}
