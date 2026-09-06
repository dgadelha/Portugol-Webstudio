import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Biblioteca: Objetos", () => {
  describe("Constantes", () => {
    test("Constantes de tipo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(
                  Objetos.TIPO_INTEIRO, " ",
                  Objetos.TIPO_CADEIA, " ",
                  Objetos.TIPO_CARACTER, " ",
                  Objetos.TIPO_REAL, " ",
                  Objetos.TIPO_LOGICO, " ",
                  Objetos.TIPO_OBJETO, " ",
                  Objetos.TIPO_VETOR
                )
              }
            }
          `,
        ),
      ).resolves.toBe("1 2 3 4 5 6 7");
    });
  });

  describe("Leitura de JSON", () => {
    test("Lê propriedades de cada tipo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"nome\\": \\"Ana\\", \\"idade\\": 30, \\"altura\\": 1.65, \\"ativo\\": true, \\"inicial\\": \\"A\\"}")
                escreva(
                  Objetos.obter_propriedade_tipo_cadeia(o, "nome"), "|",
                  Objetos.obter_propriedade_tipo_inteiro(o, "idade"), "|",
                  Objetos.obter_propriedade_tipo_real(o, "altura"), "|",
                  Objetos.obter_propriedade_tipo_logico(o, "ativo"), "|",
                  Objetos.obter_propriedade_tipo_caracter(o, "inicial")
                )
              }
            }
          `,
        ),
      ).resolves.toBe("Ana|30|1.65|verdadeiro|A");
    });

    test("Verifica a existência de propriedades", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"n\\": 1}")
                escreva(Objetos.contem_propriedade(o, "n"), "|", Objetos.contem_propriedade(o, "x"))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|falso");
    });

    test("Identifica o tipo de cada propriedade", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"s\\": \\"Ana\\", \\"c\\": \\"A\\", \\"i\\": 30, \\"r\\": 1.5, \\"b\\": true, \\"obj\\": {}, \\"vet\\": [], \\"nulo\\": null, \\"grande\\": 3000000000}")
                escreva(
                  Objetos.tipo_propriedade(o, "s"),
                  Objetos.tipo_propriedade(o, "c"),
                  Objetos.tipo_propriedade(o, "i"),
                  Objetos.tipo_propriedade(o, "r"),
                  Objetos.tipo_propriedade(o, "b"),
                  Objetos.tipo_propriedade(o, "obj"),
                  Objetos.tipo_propriedade(o, "vet"),
                  Objetos.tipo_propriedade(o, "nulo"),
                  Objetos.tipo_propriedade(o, "grande")
                )
              }
            }
          `,
        ),
      ).resolves.toBe("231456700");
    });

    test("Lê objetos aninhados", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"b\\": {\\"x\\": 10, \\"y\\": {\\"z\\": 1}}}")
                inteiro f = Objetos.obter_propriedade_tipo_objeto(o, "b")
                inteiro n = Objetos.obter_propriedade_tipo_objeto(f, "y")
                escreva(f, "|", n, "|", Objetos.obter_propriedade_tipo_inteiro(f, "x"), "|", Objetos.obter_propriedade_tipo_inteiro(n, "z"))
              }
            }
          `,
        ),
      ).resolves.toBe("1|2|10|1");
    });

    test("Aceita espaços e propriedades repetidas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_json("  {  \\"a\\"  :  1 ,  \\"b\\" : [ 1 , 2 ]  }  ")), "|", Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"a\\":1,\\"a\\":2}")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "a" : 1,\n  "b" : [ 1, 2 ]\n}|{\n  "a" : 2\n}');
    });

    test("Devolve um objeto vazio para JSON inválido", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(
                  Objetos.obter_json(Objetos.criar_objeto_via_json("nao eh json")), "|",
                  Objetos.obter_json(Objetos.criar_objeto_via_json("")), "|",
                  Objetos.obter_json(Objetos.criar_objeto_via_json("[1,2]")), "|",
                  Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"a\\":1")), "|",
                  Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"a\\":}"))
                )
              }
            }
          `,
        ),
      ).resolves.toBe("{ }|{ }|{ }|{ }|{ }");
    });

    test("O JSON null produz um objeto nulo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_json("null")))
              }
            }
          `,
        ),
      ).resolves.toBe("null");
    });

    test("Acessar um objeto nulo interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("null")
                escreva("antes ")
                escreva(Objetos.contem_propriedade(o, "x"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("Vetores", () => {
    test("Lê elementos de cada tipo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"a\\": [1, 2, 3], \\"c\\": [\\"p\\", \\"q\\"], \\"d\\": [1.5, 2.5], \\"b\\": [true, false], \\"e\\": []}")
                escreva(
                  Objetos.obter_tamanho_vetor_propriedade(o, "a"), "|",
                  Objetos.obter_propriedade_tipo_inteiro_em_vetor(o, "a", 1), "|",
                  Objetos.obter_propriedade_tipo_cadeia_em_vetor(o, "c", 0), "|",
                  Objetos.obter_propriedade_tipo_real_em_vetor(o, "d", 1), "|",
                  Objetos.obter_propriedade_tipo_logico_em_vetor(o, "b", 0), "|",
                  Objetos.obter_tamanho_vetor_propriedade(o, "e")
                )
              }
            }
          `,
        ),
      ).resolves.toBe("3|2|p|2.5|verdadeiro|0");
    });

    test("Lê objetos dentro de vetores", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"v\\": [{\\"k\\": 7}, {\\"k\\": 8}]}")
                inteiro f = Objetos.obter_propriedade_tipo_objeto_em_vetor(o, "v", 1)
                escreva(f, "|", Objetos.obter_propriedade_tipo_inteiro(f, "k"))
              }
            }
          `,
        ),
      ).resolves.toBe("1|8");
    });

    test("Percorre um vetor em laço", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"v\\":[10,20,30]}")
                inteiro i, s = 0
                para (i = 0; i < Objetos.obter_tamanho_vetor_propriedade(o, "v"); i++) {
                  s = s + Objetos.obter_propriedade_tipo_inteiro_em_vetor(o, "v", i)
                }
                escreva(s)
              }
            }
          `,
        ),
      ).resolves.toBe("60");
    });

    test("Índice acima do último interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"v\\":[1,2]}")
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_inteiro_em_vetor(o, "v", 5))
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
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"v\\":[1,2]}")
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_inteiro_em_vetor(o, "v", 0 - 1))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Propriedade que não é vetor interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"v\\":1}")
                escreva("antes ")
                escreva(Objetos.obter_tamanho_vetor_propriedade(o, "v"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("obter_json", () => {
    test("Formata o objeto como o Jackson", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"nome\\": \\"Ana\\", \\"idade\\": 30, \\"altura\\": 1.65, \\"ativo\\": true}")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "nome" : "Ana",\n  "idade" : 30,\n  "altura" : 1.65,\n  "ativo" : true\n}');
    });

    test("Mantém vetores em uma única linha", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"v\\": [{\\"k\\": 1}, {\\"k\\": 2}], \\"o\\": {}, \\"e\\": [], \\"n\\": null, \\"d\\": [1.5], \\"b\\": {\\"x\\": 10}}")))
              }
            }
          `,
        ),
      ).resolves.toBe(
        '{\n  "v" : [ {\n    "k" : 1\n  }, {\n    "k" : 2\n  } ],\n  "o" : { },\n  "e" : [ ],\n  "n" : null,\n  "d" : [ 1.5 ],\n  "b" : {\n    "x" : 10\n  }\n}',
      );
    });

    test("Aninha objetos com dois espaços por nível", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"a\\":{\\"b\\":{\\"c\\":{\\"d\\":1}}}}")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "a" : {\n    "b" : {\n      "c" : {\n        "d" : 1\n      }\n    }\n  }\n}');
    });

    test("Mistura tipos dentro de um vetor", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"v\\":[1,\\"a\\",true,null,1.5,[2],{\\"k\\":1}]}")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "v" : [ 1, "a", true, null, 1.5, [ 2 ], {\n    "k" : 1\n  } ]\n}');
    });

    test("Distingue inteiros de reais pelo literal", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"i\\":30, \\"grande\\":3000000000, \\"d\\":1.0, \\"e\\":1e2, \\"neg\\":-5, \\"zero\\":0.0, \\"f\\":-1.5}")))
              }
            }
          `,
        ),
      ).resolves.toBe(
        '{\n  "i" : 30,\n  "grande" : 3000000000,\n  "d" : 1.0,\n  "e" : 100.0,\n  "neg" : -5,\n  "zero" : 0.0,\n  "f" : -1.5\n}',
      );
    });

    test("Preserva acentos nas chaves e nos valores", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"cidade\\": \\"Itajaí\\", \\"obs\\": \\"ção\\"}")
                escreva(Objetos.obter_json(o), "|", Objetos.obter_propriedade_tipo_cadeia(o, "cidade"))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "cidade" : "Itajaí",\n  "obs" : "ção"\n}|Itajaí');
    });
  });

  describe("Entidades XML", () => {
    test("Resolve as entidades predefinidas e numéricas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a x=\\"A&amp;B\\"><b>&lt;&gt;&#65;</b></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "x" : "A&B",\n  "b" : "<>A"\n}');
    });

    test("Uma entidade desconhecida invalida o documento", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a><b>x&nbsp;y</b></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe("{ }");
    });

    test("Um E comercial solto invalida o documento", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a><b>x & y</b></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe("{ }");
    });
  });

  describe("Inteiros grandes", () => {
    test("Preserva os dígitos acima de 2^53", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_json("{\\"a\\":9007199254740993,\\"b\\":-9007199254740993}")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "a" : 9007199254740993,\n  "b" : -9007199254740993\n}');
    });

    test("Só reconhece como inteiro o que cabe em 32 bits", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"a\\":2147483647,\\"b\\":2147483648}")
                escreva(Objetos.tipo_propriedade(o, "a"), Objetos.tipo_propriedade(o, "b"))
              }
            }
          `,
        ),
      ).resolves.toBe("10");
    });
  });

  describe("Valores não finitos", () => {
    test("Escreve NaN e Infinity entre aspas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                real z = 0.0
                inteiro o = Objetos.criar_objeto()
                Objetos.atribuir_propriedade(o, "nan", z / z)
                Objetos.atribuir_propriedade(o, "inf", 2.0 / z)
                escreva(Objetos.obter_json(o))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "inf" : "Infinity",\n  "nan" : "NaN"\n}');
    });
  });

  describe("criar_objeto", () => {
    test("Cria um objeto vazio", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto()))
              }
            }
          `,
        ),
      ).resolves.toBe("{ }");
    });

    test("Ordena as propriedades pelo hash das chaves", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto()
                Objetos.atribuir_propriedade(o, "zebra", 1)
                Objetos.atribuir_propriedade(o, "alpha", "txt")
                Objetos.atribuir_propriedade(o, "meio", 2.5)
                Objetos.atribuir_propriedade(o, "bool", verdadeiro)
                Objetos.atribuir_propriedade(o, "car", 'x')
                escreva(Objetos.obter_json(o))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "zebra" : 1,\n  "bool" : true,\n  "car" : "x",\n  "alpha" : "txt",\n  "meio" : 2.5\n}');
    });

    test("Mantém a ordem por hash com outras chaves", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto()
                Objetos.atribuir_propriedade(o, "nome", "Ana")
                Objetos.atribuir_propriedade(o, "idade", 30)
                Objetos.atribuir_propriedade(o, "cidade", "Itajai")
                Objetos.atribuir_propriedade(o, "uf", "SC")
                Objetos.atribuir_propriedade(o, "cep", "88300")
                Objetos.atribuir_propriedade(o, "pais", "BR")
                escreva(Objetos.obter_json(o))
              }
            }
          `,
        ),
      ).resolves.toBe(
        '{\n  "idade" : 30,\n  "uf" : "SC",\n  "cidade" : "Itajai",\n  "nome" : "Ana",\n  "cep" : "88300",\n  "pais" : "BR"\n}',
      );
    });

    test("Reordena ao passar de 12 propriedades", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto()
                inteiro i
                para (i = 0; i < 20; i++) {
                  Objetos.atribuir_propriedade(o, "p" + i, i)
                }
                escreva(Objetos.obter_json(o))
              }
            }
          `,
        ),
      ).resolves.toBe(
        '{\n  "p0" : 0,\n  "p1" : 1,\n  "p2" : 2,\n  "p3" : 3,\n  "p4" : 4,\n  "p5" : 5,\n  "p6" : 6,\n  "p7" : 7,\n  "p8" : 8,\n  "p9" : 9,\n  "p10" : 10,\n  "p12" : 12,\n  "p11" : 11,\n  "p14" : 14,\n  "p13" : 13,\n  "p16" : 16,\n  "p15" : 15,\n  "p18" : 18,\n  "p17" : 17,\n  "p19" : 19\n}',
      );
    });

    test("Lê de volta os valores atribuídos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto()
                Objetos.atribuir_propriedade(o, "a", 1)
                Objetos.atribuir_propriedade(o, "b", 2.5)
                Objetos.atribuir_propriedade(o, "c", "txt")
                Objetos.atribuir_propriedade(o, "d", verdadeiro)
                escreva(
                  Objetos.obter_propriedade_tipo_inteiro(o, "a"), "|",
                  Objetos.obter_propriedade_tipo_real(o, "b"), "|",
                  Objetos.obter_propriedade_tipo_cadeia(o, "c"), "|",
                  Objetos.obter_propriedade_tipo_logico(o, "d")
                )
              }
            }
          `,
        ),
      ).resolves.toBe("1|2.5|txt|verdadeiro");
    });

    test("Uma cadeia de um caractere é lida como caracter", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto()
                Objetos.atribuir_propriedade(o, "r", 2.0)
                Objetos.atribuir_propriedade(o, "s", "z")
                escreva(Objetos.obter_json(o), "|", Objetos.tipo_propriedade(o, "s"), "|", Objetos.obter_propriedade_tipo_caracter(o, "s"))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "r" : 2.0,\n  "s" : "z"\n}|3|z');
    });

    test("Um caracter atribuído só aparece no JSON", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto()
                Objetos.atribuir_propriedade(o, "c", 'x')
                escreva(Objetos.obter_json(o), "|", Objetos.tipo_propriedade(o, "c"))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "c" : "x"\n}|0');
    });

    test("Ler uma cadeia vazia como caracter interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"vazio\\":\\"\\"}")
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_caracter(o, "vazio"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Ler um caracter atribuído interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto()
                Objetos.atribuir_propriedade(o, "c", 'x')
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_caracter(o, "c"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("Endereços", () => {
    test("Numera os objetos a partir de zero", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro a = Objetos.criar_objeto_via_json("{\\"n\\":1}")
                inteiro b = Objetos.criar_objeto_via_json("{\\"n\\":2}")
                inteiro c = Objetos.criar_objeto_via_json("{\\"n\\":3}")
                escreva(a, b, c)
              }
            }
          `,
        ),
      ).resolves.toBe("012");
    });

    test("Liberar um objeto desloca os endereços seguintes", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro a = Objetos.criar_objeto_via_json("{\\"n\\":1}")
                inteiro b = Objetos.criar_objeto_via_json("{\\"n\\":2}")
                inteiro c = Objetos.criar_objeto_via_json("{\\"n\\":3}")
                Objetos.liberar_objeto(a)
                escreva(
                  Objetos.obter_propriedade_tipo_inteiro(0, "n"),
                  Objetos.obter_propriedade_tipo_inteiro(1, "n"), "|",
                  Objetos.criar_objeto_via_json("{\\"n\\":9}")
                )
              }
            }
          `,
        ),
      ).resolves.toBe("23|2");
    });

    test("Liberar tudo reinicia a numeração", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro a = Objetos.criar_objeto_via_json("{\\"n\\":1}")
                Objetos.liberar()
                escreva(Objetos.criar_objeto())
              }
            }
          `,
        ),
      ).resolves.toBe("0");
    });

    test("Endereço inexistente interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_inteiro(5, "n"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Liberar endereço inexistente interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva("antes ")
                Objetos.liberar_objeto(0)
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Objeto liberado deixa de ser acessível", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro a = Objetos.criar_objeto_via_json("{\\"n\\":1}")
                Objetos.liberar()
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_inteiro(a, "n"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Cria vários objetos em laço", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro i, ultimo = 0
                para (i = 0; i < 10; i++) {
                  ultimo = Objetos.criar_objeto()
                }
                escreva(ultimo)
              }
            }
          `,
        ),
      ).resolves.toBe("9");
    });
  });

  describe("Erros de tipo", () => {
    test("Propriedade inexistente interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"n\\":1}")
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_inteiro(o, "x"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Ler um inteiro como real interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"n\\":1}")
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_real(o, "n"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Cadeia inexistente interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"n\\":1}")
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_cadeia(o, "x"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Ler um inteiro como objeto interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_json("{\\"n\\":1}")
                escreva("antes ")
                escreva(Objetos.obter_propriedade_tipo_objeto(o, "n"))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("Leitura de XML", () => {
    test("Converte elementos em propriedades de texto", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<pessoa><nome>Ana</nome><idade>30</idade><tags>a</tags><tags>b</tags></pessoa>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "nome" : "Ana",\n  "idade" : "30",\n  "tags" : "b"\n}');
    });

    test("Converte atributos em propriedades", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<p id=\\"7\\" tipo=\\"x\\"><nome>Ana</nome></p>")), "|", Objetos.obter_json(Objetos.criar_objeto_via_xml("<a x='1' y=\\"2\\"><b>t</b></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe(
        '{\n  "id" : "7",\n  "tipo" : "x",\n  "nome" : "Ana"\n}|{\n  "x" : "1",\n  "y" : "2",\n  "b" : "t"\n}',
      );
    });

    test("Aninha elementos e converte vazios em nulo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a><b><c>1</c></b><d/></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "b" : {\n    "c" : "1"\n  },\n  "d" : null\n}');
    });

    test("Distingue elemento auto-fechado de elemento vazio", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a><b>  </b><c></c><d> x </d></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "b" : "  ",\n  "c" : "",\n  "d" : " x "\n}');
    });

    test("Guarda o texto do elemento junto com os atributos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a><b at=\\"1\\"> t </b></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "b" : {\n    "at" : "1",\n    "" : " t "\n  }\n}');
    });

    test("Aproveita apenas o texto anterior ao primeiro filho", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a>ini<b>1</b>meio<c>2</c>fim</a>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "" : "ini",\n  "b" : "1",\n  "c" : "2"\n}');
    });

    test("Descarta texto em branco entre elementos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a> ini <b>1</b> fim </a>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "" : " ini ",\n  "b" : "1"\n}');
    });

    test("Usa os atributos da raiz auto-fechada", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a b=\\"1\\"/>")), "|", Objetos.obter_json(Objetos.criar_objeto_via_xml("<a><b/><c b=\\"2\\"/></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "b" : "1"\n}|{\n  "b" : null,\n  "c" : {\n    "b" : "2"\n  }\n}');
    });

    test("Ignora a declaração do documento", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<?xml version=\\"1.0\\"?><a><b>1</b></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe('{\n  "b" : "1"\n}');
    });

    test("Devolve um objeto vazio para XML inválido", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                escreva(Objetos.obter_json(Objetos.criar_objeto_via_xml("<a>")), "|", Objetos.obter_json(Objetos.criar_objeto_via_xml("<a></a>")))
              }
            }
          `,
        ),
      ).resolves.toBe("{ }|{ }");
    });

    test("Lê os valores sempre como cadeia", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Objetos

              funcao inicio() {
                inteiro o = Objetos.criar_objeto_via_xml("<p><nome>Ana</nome><idade>30</idade></p>")
                escreva(Objetos.obter_propriedade_tipo_cadeia(o, "nome"), "|", Objetos.obter_propriedade_tipo_cadeia(o, "idade"), "|", Objetos.tipo_propriedade(o, "idade"))
              }
            }
          `,
        ),
      ).resolves.toBe("Ana|30|2");
    });
  });
});
