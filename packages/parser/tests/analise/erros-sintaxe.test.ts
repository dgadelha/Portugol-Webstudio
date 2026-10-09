import { describe, expect, test } from "vitest";

import { PortugolCodeChecker } from "../../src";
import { portugol } from "../helpers/code";

/**
 * O erro de sintaxe vira um sublinhado vermelho no editor. Ele já pegou do início do arquivo
 * até a linha 9999 (o programa inteiro em vermelho) e a pessoa não achava onde estava o erro.
 */
function errosDeSintaxe(código: string) {
  const resultado = PortugolCodeChecker.checkCode(código);

  return resultado.parseErrors.map(({ code, endCol, endLine, message, startCol, startLine }) => {
    return {
      code,
      message,
      startLine,
      startCol,
      endLine,
      endCol,
    };
  });
}

describe("erros de sintaxe marcam só o token onde o código quebrou", () => {
  test("vírgula sobrando no fim de uma chamada (#468)", () => {
    const código = portugol`
      programa {
        funcao inicio() {
          inteiro i = 1
          se (i == 1) {
            escreva("a"),
          }
        }
      }
    `;

    expect(errosDeSintaxe(código)).toEqual([
      {
        code: "ErroSintatico.ErroExpressaoInesperada",
        message: "A expressão ',' não era esperada neste local, remova a expressão para corrigir o problema",
        startLine: 5,
        startCol: 18,
        endLine: 5,
        endCol: 18,
      },
    ]);
  });

  test("no fim do arquivo, marca o último token, e não uma linha vazia depois dele", () => {
    const código = portugol`
      programa {
        funcao inicio() {
          se (verdadeiro) {
            escreva("a")
        }
      }
    `;

    expect(errosDeSintaxe(código)).toMatchObject([{ startLine: 6, startCol: 0, endLine: 6, endCol: 0 }]);
  });

  test("só o primeiro erro é reportado, e sem análise semântica", () => {
    const resultado = PortugolCodeChecker.checkCode(portugol`
      programa {
        funcao inicio() {
          escreva(x),
          inteiro y = (1
        }
      }
    `);

    expect(resultado.parseErrors.map(erro => erro.startLine)).toEqual([3]);
    expect(resultado.diagnostics).toEqual([]);
  });
});

/**
 * Posição e código conferidos com o Portugol Studio (`tools/oracle/run.sh`). As exceções
 * são as divergências documentadas no `AnalisadorSintático`: o Java marca 1:1 o código fora
 * do programa e a linha depois do fim do arquivo, e às vezes sai com o código vazio.
 */
describe("o erro escolhido é o mesmo do Portugol Studio", () => {
  test.each([
    [
      "vírgula na declaração",
      portugol`
        programa {
          funcao inicio() {
            real x = 2,5
          }
        }
      `,
      [3, 15, "ErroSintatico.ErroNomeSimboloEstaFaltando.3"],
    ],
    [
      "real com vírgula no retorne",
      portugol`
        programa {
          funcao real f() {
            retorne 2,5
          }
          funcao inicio() {
          }
        }
      `,
      [3, 13, "ErroSintatico.ErroExpressaoIncompleta"],
    ],
    [
      "parêntese que não foi fechado",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = (1 + 2
            escreva(x)
          }
        }
      `,
      [4, 4, "ErroSintatico.ErroParentesis.2"],
    ],
    [
      "parêntese que não foi aberto",
      portugol`
        programa {
          funcao inicio() {
            se 1 == 1) {
            }
          }
        }
      `,
      [3, 7, "ErroSintatico.ErroParentesis.1"],
    ],
    [
      "chave da função que não foi fechada",
      portugol`
        programa {
          funcao inicio() {
            escreva("a")

          funcao outra() {
          }
        }
      `,
      [5, 2, "ErroSintatico.ErroEscopo.2"],
    ],
    [
      "se sem condição",
      portugol`
        programa {
          funcao inicio() {
            se () {
            }
          }
        }
      `,
      [3, 8, "ErroSintatico.ErroExpressaoEsperada.4"],
    ],
    [
      "elemento faltando na matriz",
      portugol`
        programa {
          funcao inicio() {
            inteiro m[][] = {{1, }, {2, 3}}
          }
        }
      `,
      [3, 25, "ErroSintatico.ErroExpressaoEsperada.3"],
    ],
    [
      "argumento vazio",
      portugol`
        programa {
          funcao inicio() {
            escreva(1, )
          }
        }
      `,
      [3, 15, "ErroSintatico.ErroExpressaoEsperada.8"],
    ],
    [
      "variável sem nome",
      portugol`
        programa {
          funcao inicio() {
            inteiro = 5
          }
        }
      `,
      [3, 12, "ErroSintatico.ErroNomeSimboloEstaFaltando.3"],
    ],
    [
      "função sem nome",
      portugol`
        programa {
          funcao () {
          }
          funcao inicio() {
          }
        }
      `,
      [2, 9, "ErroSintatico.ErroNomeSimboloEstaFaltando.2"],
    ],
    [
      "parâmetros sem tipo",
      portugol`
        programa {
          funcao f(a, b) {
          }
          funcao inicio() {
          }
        }
      `,
      [2, 11, "ErroSintatico.ErroParametrosNaoTipados"],
    ],
    [
      "colchetes no tipo do vetor",
      portugol`
        programa {
          funcao inicio() {
            inteiro[] a = {1, 2}
          }
        }
      `,
      [3, 11, "ErroSintatico.ErroExpressaoIncompleta"],
    ],
    [
      "função que retorna vetor",
      portugol`
        programa {
          funcao inteiro[] f() {
          }
          funcao inicio() {
          }
        }
      `,
      [2, 16, "ErroSintatico.ErroRetornoVetorMatriz"],
    ],
    [
      "para sem condição",
      portugol`
        programa {
          funcao inicio() {
            para (inteiro i = 0;; i++) {
            }
          }
        }
      `,
      [3, 24, "ErroSintatico.ErroParaEsperaCondicao"],
    ],
    [
      "para com um ponto e vírgula só",
      portugol`
        programa {
          funcao inicio() {
            para (inteiro i = 0; i < 3) {
            }
          }
        }
      `,
      [3, 30, "ErroSintatico.ErroTokenFaltando.3"],
    ],
    [
      "caso sem dois pontos",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = 1
            escolha (x) {
              caso 1
                escreva("a")
            }
          }
        }
      `,
      [6, 8, "ErroSintatico.ErroFaltaDoisPontos"],
    ],
    [
      "faca sem enquanto",
      portugol`
        programa {
          funcao inicio() {
            faca {
            } (verdadeiro)
          }
        }
      `,
      [4, 6, "ErroSintatico.ErroPalavraReservadaEstaFaltando"],
    ],
    [
      "constante sem tipo",
      portugol`
        programa {
          funcao inicio() {
            const x = 1
          }
        }
      `,
      [3, 10, "ErroSintatico.ErroTipoDeDadoEstaFaltando"],
    ],
    [
      "se sem comando",
      portugol`
        programa {
          funcao inicio() {
            se (verdadeiro)
          }
        }
      `,
      [4, 2, "ErroSintatico.ErroComandoEsperado"],
    ],
    [
      "caractere que não existe na linguagem",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = 1 @ 2
          }
        }
      `,
      [3, 18, "ErroSintatico.ErroExpressaoInesperada"],
    ],
    [
      "inteiro maior que 32 bits",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = 99999999999
          }
        }
      `,
      [3, 16, "ErroSintatico.ErroInteiroForaDoIntervalo"],
    ],
    [
      "código antes do programa",
      portugol`
        inteiro x
        programa {
          funcao inicio() {
          }
        }
      `,
      [1, 0, "ErroSintatico.ErroExpressoesForaEscopoPrograma"],
    ],
    [
      "código depois do programa",
      portugol`
        programa {
          funcao inicio() {
          }
        }
        escreva("x")
      `,
      [5, 0, "ErroSintatico.ErroExpressoesForaEscopoPrograma"],
    ],
  ])("%s", (_nome, código, [linha, coluna, códigoErro]) => {
    expect(errosDeSintaxe(código)).toMatchObject([{ startLine: linha, startCol: coluna, code: códigoErro }]);
  });

  test("a cadeia sem fim é `ErroCadeiaIncompleta`, e não o resto do arquivo", () => {
    // Divergência: o Java mostra `A expressão ''"abc)\n  }\n}\n'' não era esperada`.
    const código = portugol`
      programa {
        funcao inicio() {
          escreva("abc)
        }
      }
    `;

    expect(errosDeSintaxe(código)).toMatchObject([
      { startLine: 3, startCol: 12, code: "ErroSintatico.ErroCadeiaIncompleta" },
    ]);
  });

  test("o token que falta aparece como símbolo", () => {
    // Divergência: o Java mostra o nome do token na gramática, `'pontovirgula'`.
    const código = portugol`
      programa {
        funcao inicio() {
          para (inteiro i = 0; i < 3) {
          }
        }
      }
    `;

    expect(errosDeSintaxe(código)[0]?.message).toBe("A expressão está incompleta, está faltando o token ';'");
  });
});

/**
 * Casos em que a mensagem do Portugol Studio aponta o problema errado; aqui ela foi corrigida.
 */
describe("onde o Portugol Studio erra a mensagem", () => {
  test.each([
    [
      "expressão faltando depois do `=` (o Java manda inserir `(`)",
      portugol`
        programa {
          funcao inicio() {
            inteiro x =
          }
        }
      `,
      "ErroSintatico.ErroExpressaoEsperada.8",
      "Era esperada uma expressão",
    ],
    [
      "operador sem o operando da direita (o Java manda inserir `(`)",
      portugol`
        programa {
          funcao inicio() {
            inteiro x = 1 + * 2
          }
        }
      `,
      "ErroSintatico.ErroExpressaoIncompleta",
      "A expressão está incompleta. Verifique se ambos os operandos direito e esquerdo estão presentes.",
    ],
    [
      "escolha sem valor (o Java manda inserir `(`)",
      portugol`
        programa {
          funcao inicio() {
            escolha () {
            }
          }
        }
      `,
      "ErroSintatico.ErroExpressaoEsperada.7",
      'O comando "escolha" espera um valor ou uma expressão',
    ],
    [
      "senao solto (o Java diz que falta o nome da função)",
      portugol`
        programa {
          funcao inicio() {
            senao {
            }
          }
        }
      `,
      "ErroSintatico.ErroSenaoInesperado",
      "O token 'senao' não faz sentido neste local.",
    ],
    [
      "comando fora de função (o Java diz que o programa não foi fechado)",
      portugol`
        programa {
          escreva("a")
          funcao inicio() {
          }
        }
      `,
      "ErroSintatico.ErroExpressaoForaEscopoFuncao",
      "A expressão 'escreva' está fora de um escopo de função",
    ],
    [
      "palavra reservada como nome (o Java diz que o nome não foi informado)",
      portugol`
        programa {
          funcao inicio() {
            inteiro se = 1
          }
        }
      `,
      "ErroSintatico.ErroNomeSimboloEstaFaltando.3",
      "'se' é uma palavra reservada da linguagem e não pode ser usada como nome",
    ],
    [
      "expressão incompleta no corpo de um para (o Java diz que falta a condição de parada)",
      portugol`
        programa {
          funcao inicio() {
            inteiro i, p
            para (i = 1; i <= 10; i++) {
              p+
            }
          }
        }
      `,
      "ErroSintatico.ErroExpressaoIncompleta",
      "A expressão está incompleta",
    ],
    [
      "`;` no corpo de um para (o Java diz que falta a condição de parada)",
      portugol`
        programa {
          funcao inicio() {
            inteiro i
            para (i = 1; i <= 10; i++) {
              escreva(i);
            }
          }
        }
      `,
      "ErroSintatico.ErroExpressaoInesperada",
      "A expressão ';' não era esperada",
    ],
    [
      "chamada sem `)` no fim do bloco (o Java manda inserir `(`)",
      portugol`
        programa {
          funcao inicio() {
            se (verdadeiro) {
              escreva("a"
            }
          }
        }
      `,
      "ErroSintatico.ErroParentesis.2",
      "Insira o caracter ')'",
    ],
    [
      "`)` solto depois de um caso (o Java manda inserir `(`)",
      portugol`
        programa {
          funcao inicio() {
            inteiro i = 1
            escolha (i) {
              caso 1:
                )
                pare
            }
          }
        }
      `,
      "ErroSintatico.ErroExpressaoInesperada",
      "A expressão ')' não era esperada",
    ],
    [
      "real com vírgula numa atribuição (o Java diz só que a vírgula não era esperada)",
      portugol`
        programa {
          funcao inicio() {
            real p
            p = 2,5
          }
        }
      `,
      "ErroSintatico.ErroExpressaoIncompleta",
      "Valores reais devem ser expressados utilizando pontos",
    ],
  ])("%s", (_nome, código, códigoErro, trecho) => {
    const [erro] = errosDeSintaxe(código);

    expect(erro?.code).toBe(códigoErro);
    expect(erro?.message).toContain(trecho);
  });

  test("o `(` que falta de verdade continua sendo apontado", () => {
    const código = portugol`
      programa {
        funcao inicio() {
          se 1 == 1) {
          }
        }
      }
    `;

    expect(errosDeSintaxe(código)).toMatchObject([{ code: "ErroSintatico.ErroParentesis.1" }]);
  });
});

/**
 * Achados do teste de batalha (mutações dos exemplos comparadas com o Portugol Studio, mais
 * casos de borda escritos à mão).
 */
describe("casos de borda", () => {
  const programa = (corpo: string) => `programa {\n  funcao inicio() {\n${corpo}\n  }\n}\n`;

  test.each([
    ["'\\n'", String.raw`'\n'`],
    ["'\\t'", String.raw`'\t'`],
    ["'\\\\'", String.raw`'\\'`],
    ["'\\''", String.raw`'\''`],
    ["octal", String.raw`'\033'`],
    ["unicode", String.raw`'̷'`],
    ["emoji", "'😀'"],
  ])("caracter com %s é válido, como no Portugol Studio", (_nome, literal) => {
    const resultado = PortugolCodeChecker.checkCode(programa(`    caracter c = ${literal}\n    escreva(c)`));

    expect(resultado.parseErrors).toEqual([]);
    expect(resultado.diagnostics.filter(d => d.code?.startsWith("Erro"))).toEqual([]);
  });

  test("cadeia que quebra a linha é erro, como no Portugol Studio", () => {
    const { diagnostics } = PortugolCodeChecker.checkCode(programa('    escreva("a\nb")'));

    // O sublinhado vai até a aspa que fecha a cadeia, duas linhas abaixo; antes, o fim era
    // calculado na primeira linha e o editor o cortava em `"a`.
    expect(diagnostics).toMatchObject([
      { code: "ErroSintatico.ErroLinhaPuladaEmString", startLine: 3, startCol: 12, endLine: 4, endCol: 1 },
    ]);
  });

  test("um erro de sintaxe numa cadeia que engoliu linhas marca só a primeira linha dela", () => {
    // A aspa a mais depois de `Util` abre uma cadeia que só fecha no comentário de baixo.
    const [erro] = errosDeSintaxe(
      'programa {\n  inclua biblioteca Util " --> u\n\n  // fim "\n  funcao inicio() {\n  }\n}\n',
    );

    expect(erro).toMatchObject({ startLine: 2, endLine: 2 });
    expect(erro?.message).not.toContain("\n");
  });

  test.each([
    ["caracter sem fim", "    caracter c = 'a", "não foi finalizada"],
    ["caracter vazio", "    caracter c = ''", "está vazia"],
    ["acento num nome", "    inteiro ação = 1", "Nomes não podem ter acentos nem 'ç': troque o 'ç' por 'c'"],
    ["comentário sem fim", "    /* sem fim", "O comentário não foi fechado"],
    ["`v[i` no fim do código não é cadeia", "    escreva(v[0", "Era esperad"],
  ])("%s", (_nome, corpo, trecho) => {
    const código =
      corpo.includes("sem fim") || corpo.includes("v[0")
        ? `programa {\n  funcao inicio() {\n${corpo}`
        : programa(corpo);
    const [erro] = errosDeSintaxe(código);

    expect(erro?.message).toContain(trecho);
    expect(erro?.startLine).toBe(3);
  });

  test("o comentário sem fim é apontado no `/*`, e não onde o parser tropeça", () => {
    expect(errosDeSintaxe(programa("    /* sem fim\n    escreva(1)"))).toMatchObject([
      { code: "ErroWebstudio.ErroComentarioSemFim", startLine: 3, startCol: 4 },
    ]);
  });

  test.each([
    ["arquivo vazio", ""],
    ["só espaços", "  \n\n\t\n"],
    ["só comentários", "// nada\n/* nada */\n"],
  ])("%s: falta a palavra `programa`", (_nome, código) => {
    expect(errosDeSintaxe(código)).toMatchObject([
      { message: "O algoritmo está incompleto, está faltando a palavra reservada 'programa'" },
    ]);
  });

  test("o trecho antes do programa não para num `programa` dentro de comentário", () => {
    const [erro] = errosDeSintaxe("// programa antigo\ninteiro x\nprograma {\n  funcao inicio() {\n  }\n}\n");

    expect(erro).toMatchObject({ startLine: 2, startCol: 0 });
    expect(erro?.message).toContain("remova o seguinte trecho de código 'inteiro x'");
  });

  test("sem `programa` nenhum, o trecho é o código todo", () => {
    expect(errosDeSintaxe("}")[0]?.message).toContain("trecho de código '}'");
  });

  test("um emoji dentro do token não estica o fim do diagnóstico", () => {
    // `"😀😀"` ocupa as colunas 16 a 19 em pontos de código; contado em UTF-16, ia até 21.
    const { diagnostics } = PortugolCodeChecker.checkCode(programa('    inteiro x = "😀😀"'), { avisosDeUso: false });

    expect(diagnostics).toMatchObject([{ startLine: 3, startCol: 16, endLine: 3, endCol: 19 }]);
  });

  test("um emoji antes não desloca o texto lido do código", () => {
    // As posições do ANTLR contam pontos de código; as strings do JavaScript, UTF-16.
    const real = errosDeSintaxe(programa('    escreva("😀😀")\n    real x = 2,5'));
    const depois = errosDeSintaxe(`${programa('    escreva("😀😀😀")')}escreva("fora")\n`);

    expect(real[0]?.message).toContain("Uma vírgula foi mal colocada");
    expect(depois[0]?.message).toContain(`trecho de código 'escreva("fora")'`);
  });

  test("o escopo sem fim de um bloco diz o comando, e não `listaComandos`", () => {
    const [erro] = errosDeSintaxe("programa {\n  funcao inicio() {\n    se (verdadeiro) {\n      escreva(1)");

    expect(erro?.message).not.toContain("listaComandos");
  });

  test.each([
    ["programa sem `{`", "programa\n  funcao inicio() {\n  }\n}\n", "Era esperado '{' antes de 'funcao'"],
    ["só `programa`", "programa", "Era esperado '{' no fim do código"],
    [
      "inclua sem `biblioteca`",
      "programa {\n  inclua Util\n  funcao inicio() {\n  }\n}\n",
      "está faltando a palavra reservada 'biblioteca'",
    ],
  ])("mensagem do ANTLR traduzida: %s", (_nome, código, mensagem) => {
    expect(errosDeSintaxe(código)[0]?.message).toBe(
      mensagem.startsWith("está") ? `O algoritmo está incompleto, ${mensagem}` : mensagem,
    );
  });

  test("nome solto no programa que não começa comando fica como expressão inesperada", () => {
    const código = "programa {\n  inclua biblioteca Graficos lol --> g\n  funcao inicio() {\n  }\n}\n";

    expect(errosDeSintaxe(código)).toMatchObject([{ code: "ErroSintatico.ErroExpressaoInesperada" }]);
  });

  test("`2,5` como dois argumentos ou elementos continua válido", () => {
    const código = programa(
      "    inteiro v[] = {2,5}\n    inteiro m[][] = {{1,2},{3,4}}\n    inteiro a = 2,b = 5\n    escreva(2,5, v[0], m[1][1], a, b)",
    );

    expect(errosDeSintaxe(código)).toEqual([]);
  });

  test.each([
    ["atribuição", "    real p\n    p = 2,5"],
    ["negativo", "    real p\n    p = -2,5"],
    ["no meio de uma soma", "    real p\n    p = 1 + 2,5"],
    ["na condição do para", "    real i\n    para (i = 0.0; i < 2,5; i++) {\n    }"],
  ])("real com vírgula: %s", (_nome, corpo) => {
    expect(errosDeSintaxe(programa(corpo))[0]?.message).toContain(
      "Valores reais devem ser expressados utilizando pontos",
    );
  });

  test.each([
    ["com espaço depois da vírgula", "    real p\n    p = 2, 5"],
    ["com espaço antes da vírgula", "    real p\n    p = 2 ,5"],
    ["entre variáveis", "    inteiro a = 1, b = 2, p\n    p = a,b"],
  ])("vírgula sobrando que não é real: %s", (_nome, corpo) => {
    expect(errosDeSintaxe(programa(corpo))[0]?.message).toContain("A expressão ',' não era esperada");
  });

  test("CRLF não muda a posição do erro", () => {
    const código = programa('    escreva("a"),').replaceAll("\n", "\r\n");

    expect(errosDeSintaxe(código)).toMatchObject([{ startLine: 3, startCol: 16, endCol: 16 }]);
  });
});
