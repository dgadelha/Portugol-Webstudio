import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Biblioteca: Texto", () => {
  describe("numero_caracteres", () => {
    test("Conta os caracteres da cadeia", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.numero_caracteres("abcdef"), "|", Texto.numero_caracteres("a"), "|", Texto.numero_caracteres(""))
              }
            }
          `,
        ),
      ).resolves.toBe("6|1|0");
    });

    test("Conta acentos como um caractere", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.numero_caracteres("ção"), "|", Texto.numero_caracteres("Itajaí"))
              }
            }
          `,
        ),
      ).resolves.toBe("3|6");
    });

    test("Conta espaços", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.numero_caracteres("a b c"), "|", Texto.numero_caracteres("   "))
              }
            }
          `,
        ),
      ).resolves.toBe("5|3");
    });
  });

  describe("caixa_alta e caixa_baixa", () => {
    test("Transforma a caixa dos caracteres", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.caixa_alta("Olá Mundo"), "|", Texto.caixa_baixa("Olá MUNDO"))
              }
            }
          `,
        ),
      ).resolves.toBe("OLÁ MUNDO|olá mundo");
    });

    test("Transforma acentos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.caixa_alta("ção"), "|", Texto.caixa_baixa("ÇÃO"))
              }
            }
          `,
        ),
      ).resolves.toBe("ÇÃO|ção");
    });

    test("Mantém dígitos e símbolos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.caixa_alta("a1-b2"), "|", Texto.caixa_baixa("A1-B2"), "|", Texto.caixa_alta(""))
              }
            }
          `,
        ),
      ).resolves.toBe("A1-B2|a1-b2|");
    });
  });

  describe("substituir", () => {
    test("Substitui todas as ocorrências", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.substituir("banana", "an", "X"), "|", Texto.substituir("aaa", "a", "b"))
              }
            }
          `,
        ),
      ).resolves.toBe("bXXa|bbb");
    });

    test("Trata o texto procurado literalmente", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.substituir("a.b.c", ".", "-"), "|", Texto.substituir("a+b", "+", "*"))
              }
            }
          `,
        ),
      ).resolves.toBe("a-b-c|a*b");
    });

    test("Não sobrepõe ocorrências", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.substituir("aaa", "aa", "b"))
              }
            }
          `,
        ),
      ).resolves.toBe("ba");
    });

    test("Insere entre todos os caracteres quando o texto é vazio", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.substituir("abc", "", "-"))
              }
            }
          `,
        ),
      ).resolves.toBe("-a-b-c-");
    });

    test("Devolve a cadeia original quando nada é encontrado", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.substituir("abc", "z", "y"), "|", Texto.substituir("", "a", "b"))
              }
            }
          `,
        ),
      ).resolves.toBe("abc|");
    });
  });

  describe("preencher_a_esquerda", () => {
    test("Completa até o tamanho pedido", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.preencher_a_esquerda('0', 5, "42"), "|", Texto.preencher_a_esquerda('x', 6, ""))
              }
            }
          `,
        ),
      ).resolves.toBe("00042|xxxxxx");
    });

    test("Não altera cadeias já grandes o bastante", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.preencher_a_esquerda('x', 3, "abc"), "|", Texto.preencher_a_esquerda('x', 0, "abc"), "|", Texto.preencher_a_esquerda('x', 1, "abc"))
              }
            }
          `,
        ),
      ).resolves.toBe("abc|abc|abc");
    });

    test("Formata números com zeros à esquerda", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                inteiro i
                para (i = 1; i <= 3; i++) {
                  escreva(Texto.preencher_a_esquerda('0', 3, "" + i), " ")
                }
              }
            }
          `,
        ),
      ).resolves.toBe("001 002 003 ");
    });
  });

  describe("obter_caracter", () => {
    test("Obtém o caractere pelo índice", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.obter_caracter("abc", 0), Texto.obter_caracter("abc", 1), Texto.obter_caracter("abc", 2))
              }
            }
          `,
        ),
      ).resolves.toBe("abc");
    });

    test("Percorre a cadeia inteira", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                cadeia s = "abc"
                inteiro i
                para (i = 0; i < Texto.numero_caracteres(s); i++) {
                  escreva(Texto.obter_caracter(s, i), "-")
                }
              }
            }
          `,
        ),
      ).resolves.toBe("a-b-c-");
    });

    test("Obtém caracteres acentuados", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.obter_caracter("ção", 0), "|", Texto.obter_caracter("ção", 1))
              }
            }
          `,
        ),
      ).resolves.toBe("ç|ã");
    });

    test("Índice acima do último interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva("antes ")
                escreva(Texto.obter_caracter("abc", 3))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Índice negativo interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva("antes ")
                escreva(Texto.obter_caracter("abc", 0 - 1))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("posicao_texto", () => {
    test("Encontra a primeira ocorrência", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.posicao_texto("an", "banana", 0), "|", Texto.posicao_texto("banana", "banana", 0))
              }
            }
          `,
        ),
      ).resolves.toBe("1|0");
    });

    test("Procura a partir da posição informada", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.posicao_texto("an", "banana", 2), "|", Texto.posicao_texto("an", "banana", 4))
              }
            }
          `,
        ),
      ).resolves.toBe("3|-1");
    });

    test("Devolve -1 quando não encontra", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.posicao_texto("z", "banana", 0), "|", Texto.posicao_texto("a", "banana", 10))
              }
            }
          `,
        ),
      ).resolves.toBe("-1|-1");
    });

    test("Procura o texto vazio", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.posicao_texto("", "banana", 3), "|", Texto.posicao_texto("", "banana", 0))
              }
            }
          `,
        ),
      ).resolves.toBe("3|0");
    });
  });

  describe("extrair_subtexto", () => {
    test("Extrai a parte delimitada", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.extrair_subtexto("salgado", 0, 3), "|", Texto.extrair_subtexto("salgado", 3, 7), "|", Texto.extrair_subtexto("salgado", 1, 5))
              }
            }
          `,
        ),
      ).resolves.toBe("sal|gado|alga");
    });

    test("Extrai partes vazias", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva("[", Texto.extrair_subtexto("abc", 0, 0), "]|[", Texto.extrair_subtexto("abc", 3, 3), "]|[", Texto.extrair_subtexto("abc", 1, 1), "]")
              }
            }
          `,
        ),
      ).resolves.toBe("[]|[]|[]");
    });

    test("Extrai a cadeia inteira", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva(Texto.extrair_subtexto("abc", 0, 3))
              }
            }
          `,
        ),
      ).resolves.toBe("abc");
    });

    test("Posição final acima do tamanho interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva("antes ")
                escreva(Texto.extrair_subtexto("abc", 0, 5))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Posição inicial maior que a final interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva("antes ")
                escreva(Texto.extrair_subtexto("abc", 2, 1))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Posição inicial negativa interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                escreva("antes ")
                escreva(Texto.extrair_subtexto("abc", 0 - 1, 2))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("Uso combinado", () => {
    test("Inverte uma cadeia", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                cadeia s = "portugol", r = ""
                inteiro i
                para (i = Texto.numero_caracteres(s) - 1; i >= 0; i--) {
                  r = r + Texto.obter_caracter(s, i)
                }
                escreva(r)
              }
            }
          `,
        ),
      ).resolves.toBe("logutrop");
    });

    test("Conta ocorrências de um caractere", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                cadeia s = "arara"
                inteiro i, c = 0
                para (i = 0; i < Texto.numero_caracteres(s); i++) {
                  se (Texto.obter_caracter(s, i) == 'a') {
                    c++
                  }
                }
                escreva(c)
              }
            }
          `,
        ),
      ).resolves.toBe("3");
    });

    test("Encadeia funções", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Texto

              funcao inicio() {
                cadeia s = "Portugol Webstudio"
                escreva(Texto.caixa_alta(Texto.extrair_subtexto(s, 0, 8)), "|", Texto.posicao_texto("Web", s, 0), "|", Texto.numero_caracteres(s))
              }
            }
          `,
        ),
      ).resolves.toBe("PORTUGOL|9|18");
    });
  });
});
