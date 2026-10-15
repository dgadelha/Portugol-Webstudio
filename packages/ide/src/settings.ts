// https://github.com/microsoft/vscode/blob/1fe7285a1162756215a684ee702b16d0ce42bdb4/src/vs/base/common/platform.ts#L102
export const isMacintosh = navigator.userAgent.includes("Macintosh");

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

/**
 * Uma posição na tela, como a da barra flutuante da depuração. Fora disso, vale o padrão.
 */
function position(key: string): Setting<{ x: number; y: number }> {
  const defaultValue = { x: 0, y: 0 };

  return {
    key,
    default: defaultValue,
    parse: value => {
      const { x, y } = (value ?? {}) as { x?: unknown; y?: unknown };

      return typeof x === "number" && typeof y === "number" && Number.isFinite(x) && Number.isFinite(y)
        ? { x, y }
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
  editorQuickSuggestions: boolean("editorQuickSuggestions", true),
  // Desativado, os erros só aparecem ao executar.
  editorLiveDiagnostics: boolean("editorLiveDiagnostics", true),
  editorRenderLineHighlight: oneOf("editorRenderLineHighlight", ["none", "line", "all"], "line"),
  editorFolding: boolean("editorFolding", true),
  editorStickyScroll: boolean("editorStickyScroll", true),
  // Sem valor, acompanha o tamanho da fonte do editor.
  outputFontSize: integer("outputFontSize", null, fontSizeRange),
  outputClearOnRun: boolean("outputClearOnRun", true),
  outputAutoScroll: boolean("outputAutoScroll", true),
  outputWordWrap: boolean("outputWordWrap", true),
  // Desativado, uma aba de código nova já começa com o painel aberto.
  outputStartCollapsed: boolean("outputStartCollapsed", true),
  outputShowExecutionTime: boolean("outputShowExecutionTime", true),
  // Desativado, a execução passo a passo só tem o Próximo passo, sem pontos de parada.
  executionAdvancedDebugging: boolean("executionAdvancedDebugging", false),
  // Onde a barra flutuante da depuração avançada foi deixada, em relação ao alto e ao meio
  // do editor. Não aparece no diálogo de configurações.
  debugToolbarPosition: position("debugToolbarPosition"),
  // A dica da depuração avançada, na primeira depuração simples, já apareceu neste navegador.
  // Não aparece no diálogo de configurações.
  debugAdvancedTipShown: boolean("debugAdvancedTipShown", false),
  interfaceConfirmCloseTab: boolean("interfaceConfirmCloseTab", true),
  // Numa janela nova, adota as abas da última janela fechada.
  interfaceReopenTabs: boolean("interfaceReopenTabs", true),
};

export type ThemePreference = SettingValue<typeof settings.theme>;
export type EditorLineNumbers = SettingValue<typeof settings.editorLineNumbers>;
export type EditorRenderWhitespace = SettingValue<typeof settings.editorRenderWhitespace>;
export type EditorCursorStyle = SettingValue<typeof settings.editorCursorStyle>;
export type EditorRenderLineHighlight = SettingValue<typeof settings.editorRenderLineHighlight>;
