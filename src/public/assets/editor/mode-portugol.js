ace.define(
  "ace/mode/doc_comment_highlight_rules",
  ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"],
  (e, t, n) => {
    const r = e("../lib/oop");
    const i = e("./text_highlight_rules").TextHighlightRules;
    var s = function () {
      this.$rules = {
        start: [
          { token: "comment.doc.tag", regex: "@[\\w\\d_]+" },
          s.getTagRule(),
          { defaultToken: "comment.doc", caseInsensitive: !0 },
        ],
      };
    };

    r.inherits(s, i),
      (s.getTagRule = function (e) {
        return { token: "comment.doc.tag.storage.type", regex: "\\b(?:TODO|FIXME|XXX|HACK)\\b" };
      }),
      (s.getStartRule = function (e) {
        return { token: "comment.doc", regex: "\\/\\*(?=\\*)", next: e };
      }),
      (s.getEndRule = function (e) {
        return { token: "comment.doc", regex: "\\*\\/", next: e };
      }),
      (t.DocCommentHighlightRules = s);
  },
),
  ace.define(
    "ace/mode/portugol_highlight_rules",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/doc_comment_highlight_rules",
      "ace/mode/text_highlight_rules",
    ],
    (e, t, n) => {
      function a() {
        const e = o.replace("\\d", "\\d\\-");
        const t = {
          onMatch: function (e, t, n) {
            const r = e.charAt(1) == "/" ? 2 : 1;

            if (r == 1) {
              t != this.nextState ? n.unshift(this.next, this.nextState, 0) : n.unshift(this.next), n[2]++;
            } else if (r == 2 && t == this.nextState) {
              n[1]--;
              if (!n[1] || n[1] < 0) {
                n.shift(), n.shift();
              }
            }

            return [
              { type: `meta.tag.punctuation.${r == 1 ? "" : "end-"}tag-open.xml`, value: e.slice(0, r) },
              { type: "meta.tag.tag-name.xml", value: e.substr(r) },
            ];
          },
          regex: `</?${e}`,
          next: "jsxAttributes",
          nextState: "jsx",
        };

        this.$rules.start.unshift(t);
        const n = { regex: "{", token: "paren.quasi.start", push: "start" };

        (this.$rules.jsx = [n, t, { include: "reference" }, { defaultToken: "string" }]),
          (this.$rules.jsxAttributes = [
            {
              token: "meta.tag.punctuation.tag-close.xml",
              regex: "/?>",
              onMatch: function (e, t, n) {
                return (
                  t == n[0] && n.shift(),
                  e.length == 2 && (n[0] == this.nextState && n[1]--, (!n[1] || n[1] < 0) && n.splice(0, 2)),
                  (this.next = n[0] || "start"),
                  [{ type: this.token, value: e }]
                );
              },
              nextState: "jsx",
            },
            n,
            f("jsxAttributes"),
            { token: "entity.other.attribute-name.xml", regex: e },
            { token: "keyword.operator.attribute-equals.xml", regex: "=" },
            { token: "text.tag-whitespace.xml", regex: "\\s+" },
            {
              token: "string.attribute-value.xml",
              regex: "'",
              stateName: "jsx_attr_q",
              push: [
                { token: "string.attribute-value.xml", regex: "'", next: "pop" },
                { include: "reference" },
                { defaultToken: "string.attribute-value.xml" },
              ],
            },
            {
              token: "string.attribute-value.xml",
              regex: '"',
              stateName: "jsx_attr_qq",
              push: [
                { token: "string.attribute-value.xml", regex: '"', next: "pop" },
                { include: "reference" },
                { defaultToken: "string.attribute-value.xml" },
              ],
            },
            t,
          ]),
          (this.$rules.reference = [
            {
              token: "constant.language.escape.reference.xml",
              regex: "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)",
            },
          ]);
      }

      function f(e) {
        return [
          {
            token: "comment",
            regex: /\/\*/,
            next: [
              i.getTagRule(),
              { token: "comment", regex: "\\*\\/", next: e || "pop" },
              { defaultToken: "comment", caseInsensitive: !0 },
            ],
          },
          {
            token: "comment",
            regex: "\\/\\/",
            next: [
              i.getTagRule(),
              { token: "comment", regex: "$|^", next: e || "pop" },
              { defaultToken: "comment", caseInsensitive: !0 },
            ],
          },
        ];
      }

      const r = e("../lib/oop");
      var i = e("./doc_comment_highlight_rules").DocCommentHighlightRules;
      const s = e("./text_highlight_rules").TextHighlightRules;
      var o = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";
      const u = function (e) {
        const t = this.createKeywordMapper(
          {
            "variable.language": "programa|funcao|inclua|biblioteca|caso|contrario",
            keyword: "const|para|se|senao|faca|enquanto|escolha|e|nao|ou|retorne",
            "storage.type": "const|inteiro|cadeia|caracter|real|logico",
            "constant.language": "vazio",
            "support.function": "escreva|leia|limpa|pare",
            "constant.language.boolean": "verdadeiro|falso",
          },
          "identifier",
        );
        const n =
          "\\\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|u{[0-9a-fA-F]{1,6}}|[0-2][0-7]{0,2}|3[0-7][0-7]?|[4-7][0-7]?|.)";

        this.$rules = {
          no_regex: [
            i.getStartRule("doc-start"),
            f("no_regex"),
            { token: "string", regex: "'(?=.)", next: "qstring" },
            { token: "string", regex: '"(?=.)', next: "qqstring" },
            { token: "constant.numeric", regex: /0(?:[xX][0-9a-fA-F]+|[bB][01]+)\b/ },
            { token: "constant.numeric", regex: /[+-]?\d[\d_]*(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?\b/ },
            {
              token: [
                "variable.language",
                "punctuation.operator",
                "entity.name.function",
                "text",
                "keyword.operator",
                "text",
                "storage.type",
                "text",
                "paren.lparen",
              ],
              regex: `(${o})(\\.)(${o})(\\s*)(=)(\\s*)(funcao)(\\s*)(\\()`,
              next: "function_arguments",
            },
            {
              token: [
                "entity.name.function",
                "text",
                "keyword.operator",
                "text",
                "storage.type",
                "text",
                "paren.lparen",
              ],
              regex: `(${o})(\\s*)(=)(\\s*)(funcao)(\\s*)(\\()`,
              next: "function_arguments",
            },
            {
              token: [
                "variable.language",
                "punctuation.operator",
                "entity.name.function",
                "text",
                "keyword.operator",
                "text",
                "storage.type",
                "text",
                "entity.name.function",
                "text",
                "paren.lparen",
              ],
              regex: `(${o})(\\.)(${o})(\\s*)(=)(\\s*)(funcao)(\\s+)(\\w+)(\\s*)(\\()`,
              next: "function_arguments",
            },
            {
              token: ["variable.language", "text", "entity.name.function", "text", "paren.lparen"],
              regex: `(funcao)(\\s+)(${o})(\\s*)(\\()`,
              next: "function_arguments",
            },
            {
              token: [
                "entity.name.function",
                "text",
                "punctuation.operator",
                "text",
                "storage.type",
                "text",
                "paren.lparen",
              ],
              regex: `(${o})(\\s*)(:)(\\s*)(funcao)(\\s*)(\\()`,
              next: "function_arguments",
            },
            {
              token: ["text", "text", "storage.type", "text", "paren.lparen"],
              regex: "(:)(\\s*)(funcao)(\\s*)(\\()",
              next: "function_arguments",
            },
            { token: ["support.constant"], regex: /that\b/ },
            { token: t, regex: o },
            { token: "punctuation.operator", regex: /[.](?![.])/, next: "property" },
            {
              token: "keyword.operator",
              regex: /--|\+\+|\.{3}|===|==|=|!=|!==|<+=?|>+=?|!|&&|\|\||\?:|[!$%&*+\-~\/^]=?/,
              next: "start",
            },
            { token: "punctuation.operator", regex: /[?:,;.]/, next: "start" },
            { token: "paren.lparen", regex: /[\[({]/, next: "start" },
            { token: "paren.rparen", regex: /[\])}]/ },
            { token: "comment", regex: /^#!.*$/ },
          ],
          property: [
            { token: "text", regex: "\\s+" },
            {
              token: [
                "variable.language",
                "punctuation.operator",
                "entity.name.function",
                "text",
                "keyword.operator",
                "text",
                "storage.type",
                "text",
                "entity.name.function",
                "text",
                "paren.lparen",
              ],
              regex: `(${o})(\\.)(${o})(\\s*)(=)(\\s*)(funcao)(?:(\\s+)(\\w+))?(\\s*)(\\()`,
              next: "function_arguments",
            },
            { token: "punctuation.operator", regex: /[.](?![.])/ },
            { token: "identifier", regex: o },
            { regex: "", token: "empty", next: "no_regex" },
          ],
          start: [
            i.getStartRule("doc-start"),
            f("start"),
            { token: "string.regexp", regex: "\\/", next: "regex" },
            { token: "text", regex: "\\s+|^$", next: "start" },
            { token: "empty", regex: "", next: "no_regex" },
          ],
          regex: [
            { token: "regexp.keyword.operator", regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)" },
            { token: "string.regexp", regex: "/[sxngimy]*", next: "no_regex" },
            { token: "invalid", regex: /\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/ },
            { token: "constant.language.escape", regex: /\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/ },
            { token: "constant.language.delimiter", regex: /\|/ },
            { token: "constant.language.escape", regex: /\[\^?/, next: "regex_character_class" },
            { token: "empty", regex: "$", next: "no_regex" },
            { defaultToken: "string.regexp" },
          ],
          regex_character_class: [
            { token: "regexp.charclass.keyword.operator", regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)" },
            { token: "constant.language.escape", regex: "]", next: "regex" },
            { token: "constant.language.escape", regex: "-" },
            { token: "empty", regex: "$", next: "no_regex" },
            { defaultToken: "string.regexp.charachterclass" },
          ],
          function_arguments: [
            { token: "variable.parameter", regex: o },
            { token: "punctuation.operator", regex: "[, ]+" },
            { token: "punctuation.operator", regex: "$" },
            { token: "empty", regex: "", next: "no_regex" },
          ],
          qqstring: [
            { token: "constant.language.escape", regex: n },
            { token: "string", regex: "\\\\$", next: "qqstring" },
            { token: "string", regex: '"|$', next: "no_regex" },
            { defaultToken: "string" },
          ],
          qstring: [
            { token: "constant.language.escape", regex: n },
            { token: "string", regex: "\\\\$", next: "qstring" },
            { token: "string", regex: "'|$", next: "no_regex" },
            { defaultToken: "string" },
          ],
        };
        if (!e || !e.noES6) {
          this.$rules.no_regex.unshift(
            {
              regex: "[{}]",
              onMatch: function (e, t, n) {
                this.next = e == "{" ? this.nextState : "";
                if (e == "{" && n.length) {
                  n.unshift("start", t);
                } else if (e == "}" && n.length) {
                  n.shift(), (this.next = n.shift());
                  if (this.next.indexOf("string") != -1 || this.next.indexOf("jsx") != -1) {
                    return "paren.quasi.end";
                  }
                }

                return e == "{" ? "paren.lparen" : "paren.rparen";
              },
              nextState: "start",
            },
            {
              token: "string.quasi.start",
              regex: /`/,
              push: [
                { token: "constant.language.escape", regex: n },
                { token: "paren.quasi.start", regex: /\${/, push: "start" },
                { token: "string.quasi.end", regex: /`/, next: "pop" },
                { defaultToken: "string.quasi" },
              ],
            },
          ),
            (!e || e.jsx != 0) && a.call(this);
        }

        this.embedRules(i, "doc-", [i.getEndRule("no_regex")]), this.normalizeRules();
      };

      r.inherits(u, s), (t.PortugolHighlightRules = u);
    },
  ),
  ace.define("ace/mode/matching_brace_outdent", ["require", "exports", "module", "ace/range"], (e, t, n) => {
    const r = e("../range").Range;
    const i = function () {};

    (function () {
      (this.checkOutdent = function (e, t) {
        return /^\s+$/.test(e) ? /^\s*\}/.test(t) : !1;
      }),
        (this.autoOutdent = function (e, t) {
          const n = e.getLine(t);
          const i = n.match(/^(\s*\})/);

          if (!i) {
            return 0;
          }

          const s = i[1].length;
          const o = e.findMatchingBracket({ row: t, column: s });

          if (!o || o.row == t) {
            return 0;
          }

          const u = this.$getIndent(e.getLine(o.row));

          e.replace(new r(t, 0, t, s - 1), u);
        }),
        (this.$getIndent = function (e) {
          return e.match(/^\s*/)[0];
        });
    }.call(i.prototype),
      (t.MatchingBraceOutdent = i));
  }),
  ace.define(
    "ace/mode/folding/cstyle",
    ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"],
    (e, t, n) => {
      const r = e("../../lib/oop");
      const i = e("../../range").Range;
      const s = e("./fold_mode").FoldMode;
      const o = (t.FoldMode = function (e) {
        e &&
          ((this.foldingStartMarker = new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/, `|${e.start}`))),
          (this.foldingStopMarker = new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/, `|${e.end}`))));
      });

      r.inherits(o, s),
        function () {
          (this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/),
            (this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/),
            (this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/),
            (this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/),
            (this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/),
            (this._getFoldWidgetBase = this.getFoldWidget),
            (this.getFoldWidget = function (e, t, n) {
              const r = e.getLine(n);

              if (
                this.singleLineBlockCommentRe.test(r) &&
                !this.startRegionRe.test(r) &&
                !this.tripleStarBlockCommentRe.test(r)
              ) {
                return "";
              }

              const i = this._getFoldWidgetBase(e, t, n);

              return !i && this.startRegionRe.test(r) ? "start" : i;
            }),
            (this.getFoldWidgetRange = function (e, t, n, r) {
              const i = e.getLine(n);

              if (this.startRegionRe.test(i)) {
                return this.getCommentRegionBlock(e, i, n);
              }

              var s = i.match(this.foldingStartMarker);
              if (s) {
                var o = s.index;
                if (s[1]) {
                  return this.openingBracketBlock(e, s[1], n, o);
                }

                let u = e.getCommentFoldRange(n, o + s[0].length, 1);

                return u && !u.isMultiLine() && (r ? (u = this.getSectionRange(e, n)) : t != "all" && (u = null)), u;
              }

              if (t === "markbegin") {
                return;
              }

              var s = i.match(this.foldingStopMarker);
              if (s) {
                var o = s.index + s[0].length;
                return s[1] ? this.closingBracketBlock(e, s[1], n, o) : e.getCommentFoldRange(n, o, -1);
              }
            }),
            (this.getSectionRange = function (e, t) {
              let n = e.getLine(t);
              const r = n.search(/\S/);
              const s = t;
              const o = n.length;

              t += 1;
              let u = t;
              const a = e.getLength();

              while (++t < a) {
                n = e.getLine(t);
                const f = n.search(/\S/);

                if (f === -1) {
                  continue;
                }

                if (r > f) {
                  break;
                }

                const l = this.getFoldWidgetRange(e, "all", t);

                if (l) {
                  if (l.start.row <= s) {
                    break;
                  }

                  if (l.isMultiLine()) {
                    t = l.end.row;
                  } else if (r == f) {
                    break;
                  }
                }

                u = t;
              }

              return new i(s, o, u, e.getLine(u).length);
            }),
            (this.getCommentRegionBlock = function (e, t, n) {
              const r = t.search(/\s*$/);
              const s = e.getLength();
              const o = n;
              const u = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
              let a = 1;

              while (++n < s) {
                t = e.getLine(n);
                const f = u.exec(t);

                if (!f) {
                  continue;
                }

                f[1] ? a-- : a++;
                if (!a) {
                  break;
                }
              }

              const l = n;

              if (l > o) {
                return new i(o, r, l, t.length);
              }
            });
        }.call(o.prototype);
    },
  ),
  ace.define(
    "ace/mode/portugol",
    [
      "require",
      "exports",
      "module",
      "ace/lib/oop",
      "ace/mode/text",
      "ace/mode/portugol_highlight_rules",
      "ace/mode/matching_brace_outdent",
      "ace/range",
      "ace/worker/worker_client",
      "ace/mode/behaviour/cstyle",
      "ace/mode/folding/cstyle",
    ],
    (e, t, n) => {
      const r = e("../lib/oop");
      const i = e("./text").Mode;
      const s = e("./portugol_highlight_rules").PortugolHighlightRules;
      const o = e("./matching_brace_outdent").MatchingBraceOutdent;
      const u = e("../range").Range;
      const a = e("../worker/worker_client").WorkerClient;
      const f = e("./behaviour/cstyle").CstyleBehaviour;
      const l = e("./folding/cstyle").FoldMode;
      const c = function () {
        (this.HighlightRules = s),
          (this.$outdent = new o()),
          (this.$behaviour = new f()),
          (this.foldingRules = new l());
      };

      r.inherits(c, i),
        function () {
          (this.lineCommentStart = "//"),
            (this.blockComment = { start: "/*", end: "*/" }),
            (this.getNextLineIndent = function (e, t, n) {
              let r = this.$getIndent(t);
              const i = this.getTokenizer().getLineTokens(t, e);
              const s = i.tokens;
              const o = i.state;

              if (s.length && s[s.length - 1].type == "comment") {
                return r;
              }

              if (e == "start" || e == "no_regex") {
                var u = t.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);
                u && (r += n);
              } else if (e == "doc-start") {
                if (o == "start" || o == "no_regex") {
                  return "";
                }

                var u = t.match(/^\s*(\/?)\*/);
                u && (u[1] && (r += " "), (r += "* "));
              }

              return r;
            }),
            (this.checkOutdent = function (e, t, n) {
              return this.$outdent.checkOutdent(t, n);
            }),
            (this.autoOutdent = function (e, t, n) {
              this.$outdent.autoOutdent(t, n);
            }),
            (this.$id = "ace/mode/portugol");
        }.call(c.prototype),
        (t.Mode = c);
    },
  );
