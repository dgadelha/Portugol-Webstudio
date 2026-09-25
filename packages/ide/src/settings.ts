// https://github.com/microsoft/vscode/blob/1fe7285a1162756215a684ee702b16d0ce42bdb4/src/vs/base/common/platform.ts#L102
const isMacintosh = navigator.userAgent.includes("Macintosh");

// https://github.com/microsoft/vscode/blob/1fe7285a1162756215a684ee702b16d0ce42bdb4/src/vs/editor/common/config/fontInfo.ts#L240
const defaultFontSize = isMacintosh ? 12 : 14;

const fontSizeRange = { min: 6, max: 48 };

export interface Setting<T> {
  /**
   * Chave no `localStorage`. Fica escrita por extenso, e não derivada do nome
   * da configuração, porque trocá-la perde o que os usuários já escolheram.
   */
  key: string;
  default: T;
  /**
   * Converte o que está guardado — `null` quando a configuração nunca foi
   * alterada — num valor válido, ou no padrão.
   */
  parse(value: unknown): T;
}

export type SettingValue<S> = S extends Setting<infer T> ? T : never;

function boolean(key: string, defaultValue: boolean): Setting<boolean> {
  return { key, default: defaultValue, parse: value => (typeof value === "boolean" ? value : defaultValue) };
}

/**
 * Um inteiro entre `min` e `max`, inclusive. Fora da faixa — ou `NaN`,
 * `Infinity`, `null` — vale o padrão.
 */
function integer<T extends number | null>(
  key: string,
  defaultValue: T,
  { min, max }: { min: number; max: number },
): Setting<number | T> & { min: number; max: number } {
  return {
    key,
    default: defaultValue,
    min,
    max,
    parse: value => {
      const number = typeof value === "string" ? Number(value) : value;

      return typeof number === "number" && Number.isSafeInteger(number) && number >= min && number <= max
        ? number
        : defaultValue;
    },
  };
}

function oneOf<const T extends string>(key: string, values: readonly T[], defaultValue: T): Setting<T> {
  return {
    key,
    default: defaultValue,
    parse: value => values.find(option => option === value) ?? defaultValue,
  };
}

/**
 * Todas as configurações do IDE: a chave, o padrão e os valores aceitos de
 * cada uma ficam só aqui.
 */
export const settings = {
  theme: oneOf("theme", ["auto", "light", "dark"], "auto"),
  editorFontSize: integer("editorFontSize", defaultFontSize, fontSizeRange),
  editorWordWrap: boolean("editorWordWrap", false),
  editorTabSize: integer("editorTabSize", 2, { min: 1, max: 8 }),
  editorInsertSpaces: boolean("editorInsertSpaces", true),
  editorLineNumbers: oneOf("editorLineNumbers", ["on", "relative", "off"], "on"),
  editorMinimap: boolean("editorMinimap", true),
  editorBracketPairColorization: boolean("editorBracketPairColorization", true),
  editorIndentationGuides: boolean("editorIndentationGuides", true),
  editorRenderWhitespace: oneOf("editorRenderWhitespace", ["none", "selection", "all"], "selection"),
  editorAutoClosing: boolean("editorAutoClosing", true),
  editorCursorStyle: oneOf("editorCursorStyle", ["line", "block", "underline"], "line"),
  // Sem valor, acompanha o tamanho da fonte do editor.
  outputFontSize: integer("outputFontSize", null, fontSizeRange),
  outputClearOnRun: boolean("outputClearOnRun", true),
  outputAutoScroll: boolean("outputAutoScroll", true),
};

export type ThemePreference = SettingValue<typeof settings.theme>;
export type EditorLineNumbers = SettingValue<typeof settings.editorLineNumbers>;
export type EditorRenderWhitespace = SettingValue<typeof settings.editorRenderWhitespace>;
export type EditorCursorStyle = SettingValue<typeof settings.editorCursorStyle>;
