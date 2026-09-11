import { describe, expect, test } from "vitest";

import { analisar } from "../helpers/analise";
import { portugol } from "../helpers/code";

/**
 * Conferido contra o analisador do Portugol Studio, com a exceção anotada em cada caso.
 */
describe("Chamadas de função", () => {
  test("#22/#23 número de parâmetros e argumentos excedentes", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            escreva()
            limpa(1)
            f()
            f(1, 2)
          }
          funcao inteiro f(inteiro n) { retorne n }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:4/3:10 E [ErroSemantico.ErroNumeroParametrosFuncao]: A função "escreva" espera ao menos um parâmetro, mas não foi passado nenhum parâmetro,
        4:4/4:8 E [ErroSemantico.ErroNumeroParametrosFuncao]: A função "limpa" não espera nenhum parâmetro, mas foi passado 1 parâmetro.,
        4:10/4:10 E [ErroSemantico.ErroParametroExcedente]: A expressão está sobrando na chamada da função "limpa", pois extrapola o número de parâmetros esperados,
        5:4/5:4 E [ErroSemantico.ErroNumeroParametrosFuncao]: A função "f" espera 1 parâmetro, mas não foi passado nenhum parâmetro,
        6:4/6:4 E [ErroSemantico.ErroNumeroParametrosFuncao]: A função "f" espera 1 parâmetro, mas foram passados 2 parâmetros.,
        6:9/6:9 E [ErroSemantico.ErroParametroExcedente]: A expressão está sobrando na chamada da função "f", pois extrapola o número de parâmetros esperados,
      ]
    `);
  });

  test("#24 tipo de parâmetro incompatível", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            escreva(dobro("texto"))
          }
          funcao inteiro dobro(inteiro x) { retorne x * 2 }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:18/3:24 E [ErroSemantico.ErroTipoParametroIncompativel]: Tipos incompatíveis! O parâmetro "x" da função "dobro" espera uma expressão do tipo "inteiro", mas foi passada uma expressão do tipo "cadeia",
      ]
    `);
  });

  test("#25 quantificador de parâmetro (valor onde se espera vetor)", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro x = 1
            escreva(soma(x))
          }
          funcao inteiro soma(inteiro n[]) { retorne n[0] }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        4:17/4:17 E [ErroSemantico.ErroQuantificadorParametroFuncao.21]: O parâmetro "n" da função "soma" espera um vetor, mas foi passado um valor,
      ]
    `);
  });

  test("#25 vetor e matriz nos parâmetros certos não geram erro", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            inteiro v[2] = {1, 2}
            inteiro m[2][2] = {{1, 2}, {3, 4}}
            escreva(soma(v), total(m))
          }
          funcao inteiro soma(inteiro n[]) { retorne n[0] }
          funcao inteiro total(inteiro n[][]) { retorne n[0][0] }
        }
      `),
    ).toMatchInlineSnapshot(`[]`);
  });

  test("#26 parâmetro por referência recusa literal, constante e posição de vetor", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro K = 1
          funcao inicio() {
            inteiro x = 0
            inteiro v[2] = {1, 2}
            troca(x)
            troca(1)
            troca(K)
            troca(v[0])
            escreva(x)
          }
          funcao troca(inteiro &a) { a = 2 }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        7:10/7:10 E [ErroSemantico.ErroPassagemParametroInvalida]: Não é possível passar uma expressão constante para o parâmetro "a" da função "troca", pois este parâmetro espera uma referência,
        8:10/8:10 E [ErroSemantico.ErroPassagemParametroInvalida]: Não é possível passar uma expressão constante para o parâmetro "a" da função "troca", pois este parâmetro espera uma referência,
        9:10/9:13 E [ErroSemantico.ErroPassagemParametroInvalida]: Não é possível passar uma expressão constante para o parâmetro "a" da função "troca", pois este parâmetro espera uma referência,
      ]
    `);
  });

  test("#27 leia exige referência não constante", () => {
    expect(
      analisar(portugol`
        programa {
          const inteiro K = 1
          funcao inicio() {
            inteiro x
            inteiro v[2] = {1, 2}
            leia(x)
            leia(v[0])
            leia(1)
            leia(K)
            leia(x + 1)
            escreva(x)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        8:9/8:9 E [ErroSemantico.ErroPassagemParametroInvalida]: Não é possível passar um valor literal, constante ou expressão para o parâmetro na posição "1" da função "leia". Tente passar uma variável, vetor ou matriz que não tenha sido declarada como constante,
        9:9/9:9 E [ErroSemantico.ErroPassagemParametroInvalida]: Não é possível passar um valor literal, constante ou expressão para o parâmetro na posição "1" da função "leia". Tente passar uma variável, vetor ou matriz que não tenha sido declarada como constante,
        10:9/10:13 E [ErroSemantico.ErroPassagemParametroInvalida]: Não é possível passar um valor literal, constante ou expressão para o parâmetro na posição "1" da função "leia". Tente passar uma variável, vetor ou matriz que não tenha sido declarada como constante,
      ]
    `);
  });

  test("#28 escreva não aceita expressão de tipo vazio", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            escreva(nada())
          }
          funcao nada() { }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:12/3:17 E [ErroSemantico.ErroTipoParametroIncompativel]: Você não pode passar uma função sem retorno para a função "escreva",
      ]
    `);
  });

  test("#29 sorteia exige dois inteiros", () => {
    // O `sorteia` global também é recusado pelo Webstudio; aqui o foco é a checagem de
    // tipos, que o Portugol Studio faz igual.
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            escreva(sorteia(1.5, 2))
          }
        }
      `).filter(diagnóstico => diagnóstico.code !== "ErroWebstudio.ErroFuncaoReservadaNaoSuportada"),
    ).toMatchInlineSnapshot(`
      [
        3:20/3:22 E [ErroSemantico.ErroTipoParametroIncompativel]: Tipos incompatíveis! O parâmetro "" da função "sorteia" espera uma expressão do tipo "inteiro", mas foi passada uma expressão do tipo "real",
      ]
    `);
  });

  test("chamada de função inexistente não cascateia nos argumentos", () => {
    expect(
      analisar(portugol`
        programa {
          funcao inicio() {
            naoexiste(naoexiste2)
          }
        }
      `),
    ).toMatchInlineSnapshot(`
      [
        3:4/3:12 E [ErroSemantico.ErroSimboloNaoDeclarado.4]: A função "naoexiste" não foi declarada no programa,
      ]
    `);
  });
});
