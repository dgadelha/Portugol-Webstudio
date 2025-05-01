import type monaco from "monaco-editor";

/**
 * The Monarch language definition for the Portugol language.
 */
export const PortugolMonarchLanguage: monaco.languages.IMonarchLanguage = {
  defaultToken: "invalid",
  tokenPostfix: ".portugol",

  brackets: [
    { token: "delimiter.bracket", open: "{", close: "}" },
    { token: "delimiter.array", open: "[", close: "]" },
    { token: "delimiter.parenthesis", open: "(", close: ")" },
  ],

  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"', notIn: ["string"] },
    { open: "'", close: "'", notIn: ["string", "comment"] },
    { open: "`", close: "`", notIn: ["string", "comment"] },
    { open: "/**", close: " */", notIn: ["string"] },
  ],

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

  // we include these common regular expressions
  symbols: /[!%&*+/:<=>?^|~\-]+/,
  escapes: /\\(?:["'\\abfnrtv]|x[\dA-Fa-f]{1,4}|u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,
  octaldigits: /[0-7]+(_+[0-7]+)*/,
  binarydigits: /[01]+(_+[01]+)*/,
  hexdigits: /[\dA-F[a-f]+(_+[\dA-Fa-f]+)*/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [[/[{}]/, "delimiter.bracket"], [/([1A-Z_a-z{}]\w+)(?=\s*\()/, "functions"], { include: "common" }],
    common: [
      // identifiers and keywords
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
      [/[A-Z][\w$]*/, "type.identifier"], // to show class names nicely

      // whitespace
      { include: "@whitespace" },

      // delimiters and operators
      [/[()[\]{}]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

      // numbers
      [/\d*\.\d+([Ee][+\-]?\d+)?/, "number.float"],
      [/0[Xx][\dA-Fa-f]+/, "number.hex"],
      [/\d+/, "number"],

      // delimiter: after number because of .\d floats
      [/[,.;]/, "delimiter"],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

      // characters
      [/'[^'\\]'/, "string"],
      [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
      [/'/, "string.invalid"],
    ],

    comment: [
      [/[^*/]+/, "comment"],
      [/\/\*/, "comment", "@push"], // nested comment
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
