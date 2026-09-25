import type { Monaco } from "@monaco-editor/react";
import type { languages } from "monaco-editor";

const autoClosingPairs: languages.IAutoClosingPairConditional[] = [
  { open: "{", close: "}" },
  { open: "[", close: "]" },
  { open: "(", close: ")" },
  { open: '"', close: '"', notIn: ["string"] },
  { open: "'", close: "'", notIn: ["string", "comment"] },
  { open: "`", close: "`", notIn: ["string", "comment"] },
  { open: "/**", close: " */", notIn: ["string"] },
];

function languageConfiguration(monaco: Monaco): languages.LanguageConfiguration {
  return {
    wordPattern: /(-?\d*\.\d\w*)|([^\s!"#%&'()*+,./:;<=>?@[\\\]^`{|}~\-]+)/g,

    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },

    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],

    onEnterRules: [
      {
        // e.g. /** | */
        beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
        afterText: /^\s*\*\/$/,
        action: { indentAction: monaco.languages.IndentAction.IndentOutdent, appendText: " * " },
      },
      {
        // e.g. /** ...|
        beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
        action: { indentAction: monaco.languages.IndentAction.None, appendText: " * " },
      },
      {
        // e.g.  * ...|
        beforeText: /^(\t|( {2}))* \*( ([^*]|\*(?!\/))*)?$/,
        action: { indentAction: monaco.languages.IndentAction.None, appendText: "* " },
      },
      {
        // e.g.  */|
        beforeText: /^(\t|( {2}))* \*\/\s*$/,
        action: { indentAction: monaco.languages.IndentAction.None, removeText: 1 },
      },
    ],

    autoClosingPairs,

    folding: {
      markers: {
        start: /^\s*\/\/\s*#?region\b/,
        end: /^\s*\/\/\s*#?endregion\b/,
      },
    },
  };
}

// @see: https://microsoft.github.io/monaco-editor/monarch.html
const monarchLanguage: languages.IMonarchLanguage & Record<string, unknown> = {
  defaultToken: "invalid",
  tokenPostfix: ".portugol",
  autoClosingPairs,

  keywords: [
    "faca",
    "enquanto",
    "para",
    "se",
    "senao",
    "const",
    "funcao",
    "programa",
    "escolha",
    "caso",
    "contrario",
    "pare",
    "retorne",
    "inclua",
    "biblioteca",
    "verdadeiro",
    "falso",
  ],

  typeKeywords: ["real", "inteiro", "vazio", "logico", "cadeia", "caracter"],

  operators: [
    "nao",
    "e",
    "ou",
    "-",
    "+",
    "*",
    "/",
    "%",
    "=",
    "==",
    "!=",
    ">",
    "<",
    "<=",
    ">=",
    "++",
    "--",
    "<<",
    ">>",
    "^",
    "|",
    "~",
    "-->",
    "&",
    "+=",
    "-=",
    "*=",
    "/=",
  ],

  symbols: /[!%&*+/:<=>?^|~\-]+/,
  escapes: /\\(?:["'\\abfnrtv]|x[\dA-Fa-f]{1,4}|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,
  octaldigits: /[0-7]+(_+[0-7]+)*/,
  binarydigits: /[01]+(_+[01]+)*/,
  hexdigits: /[\dA-F[a-f]+(_+[\dA-Fa-f]+)*/,

  tokenizer: {
    root: [[/[{}]/, "delimiter.bracket"], [/([1A-Z_a-z{}]\w+)(?=\s*\()/, "functions"], { include: "common" }],
    common: [
      // identificadores e palavras reservadas
      [
        /[$_a-z][\w$]*/,
        {
          cases: {
            "@typeKeywords": "keyword",
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],
      [/[A-Z][\w$]*/, "type.identifier"],

      { include: "@whitespace" },

      // delimitadores e operadores
      [/[()[\]{}]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

      // números
      [/\d*\.\d+([Ee][+\-]?\d+)?/, "number.float"],
      [/0[Xx][\dA-Fa-f]+/, "number.hex"],
      [/\d+/, "number"],

      // delimitador: depois dos números por causa dos reais como .5
      [/[,.;]/, "delimiter"],

      // cadeias
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

      // caracteres
      [/'[^'\\]'/, "string"],
      [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
      [/'/, "string.invalid"],
    ],

    comment: [
      [/[^*/]+/, "comment"],
      [/\/\*/, "comment", "@push"],
      [String.raw`\*/`, "comment", "@pop"],
      [/[*/]/, "comment"],
    ],

    string: [
      [/[^"\\]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[\t\n\r ]+/, "white"],
      [/\/\*/, "comment", "@comment"],
      [/\/\/.*$/, "comment"],
    ],

    bracketCounting: [
      [/{/, "delimiter.bracket", "@bracketCounting"],
      [/}/, "delimiter.bracket", "@pop"],
      { include: "common" },
    ],
  },
};

let registered = false;

/**
 * Registra a linguagem e os temas do Portugol. Pode ser chamada por todo editor antes de montar.
 */
export function registerPortugolLanguage(monaco: Monaco) {
  if (registered) {
    return;
  }

  registered = true;

  monaco.languages.register({ id: "portugol", extensions: [".por"], aliases: ["Portugol"] });
  monaco.languages.setLanguageConfiguration("portugol", languageConfiguration(monaco));
  monaco.languages.setMonarchTokensProvider("portugol", monarchLanguage);

  monaco.editor.defineTheme("portugol-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "functions", foreground: "F5D7A9" },
      { token: "string.escape", foreground: "D2BB85" },
      { token: "string.escape.invalid", foreground: "DF5953" },
    ],
    // Fundos do tema neutral do shadcn, para o editor se fundir com a interface.
    colors: {
      "editor.background": "#0a0a0a",
      "editorGutter.background": "#0a0a0a",
      "minimap.background": "#0a0a0a",
      "editor.lineHighlightBackground": "#171717",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#525252",
      "editorLineNumber.activeForeground": "#d4d4d4",
      "editorWidget.background": "#171717",
      "editorWidget.border": "#262626",
      "editorHoverWidget.background": "#171717",
      "editorHoverWidget.border": "#262626",
      "editorSuggestWidget.background": "#171717",
      "editorSuggestWidget.border": "#262626",
      "scrollbarSlider.background": "#ffffff14",
      "scrollbarSlider.hoverBackground": "#ffffff26",
    },
  });

  monaco.editor.defineTheme("portugol-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "functions", foreground: "AD7F00" },
      { token: "string.escape", foreground: "DC009E" },
      { token: "string.escape.invalid", foreground: "DF5953" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editorGutter.background": "#ffffff",
      "minimap.background": "#ffffff",
      "editor.lineHighlightBackground": "#f5f5f5",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#a3a3a3",
      "editorLineNumber.activeForeground": "#171717",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#e5e5e5",
      "editorHoverWidget.background": "#ffffff",
      "editorHoverWidget.border": "#e5e5e5",
      "editorSuggestWidget.background": "#ffffff",
      "editorSuggestWidget.border": "#e5e5e5",
      "scrollbarSlider.background": "#0000000f",
      "scrollbarSlider.hoverBackground": "#00000024",
    },
  });
}
