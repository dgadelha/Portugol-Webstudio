import { Injectable } from "@angular/core";
import { MonacoEditorLoaderService } from "@materia-ui/ngx-monaco-editor";
import { filter, take } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class MonacoService {
  constructor(private monacoLoaderService: MonacoEditorLoaderService) {
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => isLoaded),
        take(1),
      )
      .subscribe(() => {
        try {
          monaco.languages.register({
            id: "portugol",
            extensions: [".por"],
            aliases: ["Portugol"],
          });

          monaco.languages.setLanguageConfiguration("portugol", {
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
                action: {
                  indentAction: monaco.languages.IndentAction.IndentOutdent,
                  appendText: " * ",
                },
              },
              {
                // e.g. /** ...|
                beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
                action: {
                  indentAction: monaco.languages.IndentAction.None,
                  appendText: " * ",
                },
              },
              {
                // e.g.  * ...|
                beforeText: /^(\t|( {2}))* \*( ([^*]|\*(?!\/))*)?$/,
                action: {
                  indentAction: monaco.languages.IndentAction.None,
                  appendText: "* ",
                },
              },
              {
                // e.g.  */|
                beforeText: /^(\t|( {2}))* \*\/\s*$/,
                action: {
                  indentAction: monaco.languages.IndentAction.None,
                  removeText: 1,
                },
              },
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

            folding: {
              markers: {
                start: /^\s*\/\/\s*#?region\b/,
                end: /^\s*\/\/\s*#?endregion\b/,
              },
            },
          });

          // @see: https://microsoft.github.io/monaco-editor/monarch.html
          monaco.languages.setMonarchTokensProvider("portugol", {
            defaultToken: "invalid",
            tokenPostfix: ".portugol",
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
          } as monaco.languages.IMonarchLanguage);

          monaco.editor.defineTheme("portugol-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "functions", foreground: "F5D7A9" },
              { token: "string.escape", foreground: "D2BB85" },
              { token: "string.escape.invalid", foreground: "DF5953" },
            ],
            colors: {},
          });

          monaco.editor.defineTheme("portugol-light", {
            base: "vs",
            inherit: true,
            rules: [
              { token: "functions", foreground: "F5D7A9" },
              { token: "string.escape", foreground: "D2BB85" },
              { token: "string.escape.invalid", foreground: "DF5953" },
            ],
            colors: {},
          });
        } catch (error) {
          console.error(error);
          window.location.reload();
        }
      });
  }
}
