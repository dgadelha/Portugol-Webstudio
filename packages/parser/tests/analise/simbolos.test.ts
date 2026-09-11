import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

describe("Símbolos", () => {
  describe("ErroSimboloNaoDeclarado", () => {
    test("variável, função e vetor inexistentes", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              escreva(naoexiste)
              naoexiste2()
              naoexiste3[0] = 1
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:12/3:20 E [ErroSemantico.ErroSimboloNaoDeclarado.3]: A variável "naoexiste" não foi declarada neste escopo.,
          4:4/4:13 E [ErroSemantico.ErroSimboloNaoDeclarado.4]: A função "naoexiste2" não foi declarada no programa,
          5:4/5:13 E [ErroSemantico.ErroSimboloNaoDeclarado.1]: O vetor "naoexiste3" não foi declarado neste escopo.,
        ]
      `);
    });

    test("matriz inexistente", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              escreva(naoexiste[0][1])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:12/3:20 E [ErroSemantico.ErroSimboloNaoDeclarado.2]: A matriz "naoexiste" não foi declarada neste escopo.,
        ]
      `);
    });

    test("variável declarada depois do uso, no mesmo escopo", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              escreva(x)
              inteiro x = 1
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:12/3:12 E [ErroSemantico.ErroSimboloNaoDeclarado.3]: A variável "x" não foi declarada neste escopo.,
        ]
      `);
    });

    test("global declarada depois das funções é visível dentro delas", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              escreva(x)
            }

            inteiro x = 10
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Escopo", () => {
    test("redeclaração no mesmo escopo", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x = 10
              inteiro x = 20
              escreva(x)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:12/4:12 E [ErroSemantico.ErroSimboloRedeclarado.3]: O símbolo "x" já foi declarado como uma variável na linha: 3, coluna: 12.,
        ]
      `);
    });

    test("declarar em bloco aninhado um nome que já existe na função é erro", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x = 1
              se (verdadeiro) {
                inteiro x = 2
                escreva(x)
              }
              escreva(x)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          5:14/5:14 E [ErroSemantico.ErroSimboloRedeclarado.3]: O símbolo "x" já foi declarado como uma variável na linha: 3, coluna: 12.,
        ]
      `);
    });

    test("o sub-escopo do enquanto é desempilhado ao sair", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              enquanto (falso) { inteiro k = 1  escreva(k) }
              inteiro k = 2
              escreva(k)
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("os dois ramos do se são sub-escopos independentes", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              se (verdadeiro) { inteiro q = 1  escreva(q) } senao { inteiro q = 2  escreva(q) }
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("a variável do para não vaza, e o nome pode ser reusado depois", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              para (inteiro i = 0; i < 3; i++) { escreva(i) }
              inteiro i = 5
              escreva(i)
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("usar a variável do para depois dele é erro", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              para (inteiro i = 0; i < 3; i++) { escreva(i) }
              escreva(i)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:12/4:12 E [ErroSemantico.ErroSimboloNaoDeclarado.3]: A variável "i" não foi declarada neste escopo.,
        ]
      `);
    });

    test("declarar no para um nome que já é parâmetro da função é erro", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { f(1) }
            funcao f(inteiro n) {
              para (inteiro n = 0; n < 3; n++) { }
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:18/4:18 E [ErroSemantico.ErroSimboloRedeclarado.3]: O símbolo "n" já foi declarado como uma variável na linha: 3, coluna: 19.,
        ]
      `);
    });

    test("parâmetro repetido na mesma função", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { escreva(teste(1, 2)) }
            funcao inteiro teste(inteiro x, inteiro x) {
              retorne x
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:42/3:42 E [ErroSemantico.ErroParametroRedeclarado]: O parâmetro "x" já foi declarado na função "teste".,
        ]
      `);
    });

    test("parâmetro com o mesmo nome de variável de outra função é ok", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro n = 1
              escreva(f(n))
            }
            funcao inteiro f(inteiro n) { retorne n }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("declaração local que oculta um global é aviso, não erro", () => {
      expect(
        analisar(portugol`
          programa {
            inteiro n = 1
            funcao inicio() {
              inteiro n = 2
              escreva(n)
            }
            funcao f(inteiro n) { escreva(n) }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:12/4:12 W [AvisoSemantico.AvisoSimboloGlobalOcultado]: A variável "n" está ocultando uma variável do escopo global.,
          7:19/7:19 W [AvisoSemantico.AvisoSimboloGlobalOcultado]: A variável "n" está ocultando uma variável do escopo global.,
        ]
      `);
    });

    test("declarar variável com nome de função reservada", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro escreva = 1
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:12/3:18 E [ErroSemantico.ErroSimboloRedeclarado.4]: O símbolo "escreva" já foi declarado como uma função,
        ]
      `);
    });
  });

  describe("ErroSimboloNaoInicializado", () => {
    test("não é sensível a fluxo: atribuição dentro do se já conta", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro a
              se (verdadeiro) { a = 1 }
              escreva(a)
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("erro só na primeira leitura", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro z
              escreva(z)
              z = 1
              escreva(z)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:12/4:12 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "z" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro z = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(z),
        ]
      `);
    });

    test("o lado direito da atribuição vê o flag antigo", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro c
              c = c + 1
              escreva(c)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:8/4:8 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "c" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro c = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(c),
        ]
      `);
    });

    test("declaração com auto-referência", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro c = c + 1
              escreva(c)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:16/3:16 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "c" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro c = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(c),
        ]
      `);
    });

    test("atribuição composta e incremento acusam quando o alvo não foi inicializado", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x
              x += 1
              inteiro y
              y++
              escreva(x, y)
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:4/4:4 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "x" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro x = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(x),
          6:4/6:4 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "y" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro y = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(y),
        ]
      `);
    });

    test("leia inicializa", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro b
              leia(b)
              escreva(b)
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("vetores e matrizes nascem inicializados", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro d[3]
              inteiro m[2][2]
              escreva(d[0], m[0][0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("global não inicializada", () => {
      expect(
        analisar(portugol`
          programa {
            inteiro g
            funcao inicio() { escreva(g) }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          3:28/3:28 E [ErroSemantico.ErroSimboloNaoInicializado.3]: A variável "g" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. Você pode inicializar a variável atribuindo um valor do tipo "inteiro". Exemplo: inteiro g = 0. Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(g),
        ]
      `);
    });

    test("parâmetros nascem inicializados", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() { f(1) }
            funcao f(inteiro n) { escreva(n) }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("ErroReferenciaInvalida", () => {
    test("vetor usado como variável, variável usada como vetor", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro v[3] = {1, 2, 3}
              inteiro x = 1
              escreva(v)
              v = 3
              x[0] = 1
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          5:12/5:12 E [ErroSemantico.ErroReferenciaInvalida.11]: O vetor 'v' está sendo utilizado como uma variável,
          6:4/6:4 E [ErroSemantico.ErroReferenciaInvalida.11]: O vetor 'v' está sendo utilizado como uma variável,
          7:4/7:7 E [ErroSemantico.ErroReferenciaInvalida.33]: A variável 'x' está sendo utilizada como um vetor,
        ]
      `);
    });

    test("matriz usada como vetor", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro m[2][2] = {{1, 2}, {3, 4}}
              escreva(m[0])
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:12/4:15 E [ErroSemantico.ErroReferenciaInvalida.23]: A matriz 'm' está sendo utilizada como um vetor,
        ]
      `);
    });

    test("variável usada como função", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro x = 1
              escreva(x())
            }
          }
        `),
      ).toMatchInlineSnapshot(`
        [
          4:12/4:14 E [ErroSemantico.ErroReferenciaInvalida.34]: A variável 'x' está sendo utilizada como uma função,
        ]
      `);
    });

    test("passar vetor para função do usuário não é uso como variável", () => {
      expect(
        analisar(portugol`
          programa {
            funcao inicio() {
              inteiro v[3] = {1, 2, 3}
              escreva(soma(v))
            }
            funcao inteiro soma(inteiro n[]) { retorne n[0] }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("passar vetor por referência para biblioteca não é uso como variável", () => {
      expect(
        analisar(portugol`
          programa {
            inclua biblioteca Util --> u
            funcao inicio() {
              inteiro v[3] = {1, 2, 3}
              caracter m[2][2]
              escreva(u.numero_elementos(v), u.numero_linhas(m), u.numero_colunas(m))
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("matriz passada por referência para função do usuário", () => {
      expect(
        analisar(portugol`
          programa {
            inclua biblioteca Util --> u
            funcao inicio() {
              caracter matriz[5][5]
              preenche(matriz)
            }
            funcao preenche(caracter &matriz[][]) {
              para (inteiro linha = 0; linha < u.numero_linhas(matriz); linha++) {
                matriz[linha][0] = '*'
              }
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("Constantes de biblioteca", () => {
    test("o tipo da constante é resolvido e a atribuição é verificada", () => {
      expect(
        analisar(portugol`
          programa {
            inclua biblioteca Matematica --> mat
            funcao inicio() {
              real area = mat.PI * 2.0
              escreva(area)
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });

    test("constante de biblioteca não vira variável não declarada", () => {
      expect(
        analisar(portugol`
          programa {
            inclua biblioteca Graficos --> g
            funcao inicio() {
              g.definir_cor(g.COR_PRETO)
            }
          }
        `),
      ).toMatchInlineSnapshot(`[]`);
    });
  });
});
