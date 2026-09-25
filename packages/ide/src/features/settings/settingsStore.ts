import { memoryStorage, usableStorage } from "@/lib/browserStorage";

export type ThemePreference = "auto" | "light" | "dark";

export interface Settings {
  theme: ThemePreference;
  editorFontSize: number;
  editorWordWrap: boolean;
}

// https://github.com/microsoft/vscode/blob/1fe7285a1162756215a684ee702b16d0ce42bdb4/src/vs/editor/common/config/fontInfo.ts#L240
export const DEFAULT_FONT_SIZE = navigator.userAgent.includes("Macintosh") ? 12 : 14;

export const FONT_SIZE_RANGE = { min: 6, max: 48 };

export const DEFAULT_SETTINGS: Settings = {
  theme: "auto",
  editorFontSize: DEFAULT_FONT_SIZE,
  editorWordWrap: false,
};

/**
 * Mesmas chaves que a versão anterior do IDE gravava (prefixo `pws:`, em minúsculas e em JSON),
 * para que as preferências de quem já usa o site continuem valendo.
 */
const STORAGE_KEYS: Record<keyof Settings, string> = {
  theme: "pws:theme",
  editorFontSize: "pws:editorfontsize",
  editorWordWrap: "pws:editorwordwrap",
};

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

function normalize(stored: Partial<Record<keyof Settings, unknown>>): Settings {
  const theme = stored.theme === "light" || stored.theme === "dark" ? stored.theme : "auto";
  const fontSize = Number.parseInt(String(stored.editorFontSize), 10);

  return {
    theme,
    editorFontSize: Number.isFinite(fontSize) && fontSize > 0 ? fontSize : DEFAULT_FONT_SIZE,
    editorWordWrap: Boolean(stored.editorWordWrap),
  };
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
    return normalize({
      theme: parseStored(this.storage.getItem(STORAGE_KEYS.theme)),
      editorFontSize: parseStored(this.storage.getItem(STORAGE_KEYS.editorFontSize)),
      editorWordWrap: parseStored(this.storage.getItem(STORAGE_KEYS.editorWordWrap)),
    });
  }

  private refresh() {
    this.snapshot = this.read();

    for (const listener of this.listeners) {
      listener();
    }
  }

  private readonly onStorage = (event: StorageEvent) => {
    if (event.key === null || Object.values(STORAGE_KEYS).includes(event.key)) {
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
      this.storage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to persist setting", key, error);
    }

    this.refresh();
  }

  /**
   * Só as configurações voltam ao padrão: o código em edição, no mesmo storage, fica intacto.
   */
  reset() {
    for (const key of Object.values(STORAGE_KEYS)) {
      try {
        this.storage.removeItem(key);
      } catch {
        // A chave já é inacessível.
      }
    }

    this.refresh();
  }
}

export const settingsStore = new SettingsStore();
