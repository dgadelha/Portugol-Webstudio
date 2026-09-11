import { describe, expect, test } from "vitest";

import { bibliotecas } from "@portugol-recursos/bibliotecas";

import {
  consultarCompatibilidade,
  célulaDaTabela,
  TIPO_TODOS,
  tipoDaBiblioteca,
  TipoPrimitivo,
  TIPOS_DA_TABELA,
} from "../../src";

const { CADEIA, CARACTER, INTEIRO, LÓGICO, REAL, VAZIO } = TipoPrimitivo;
const TIPOS_DE_BIBLIOTECA: ReadonlySet<string> = new Set<string>([...Object.values(TipoPrimitivo), TIPO_TODOS]);

describe("TabelaCompatibilidade", () => {
  test("cobre os sete tipos do Java, incluindo o curinga das bibliotecas", () => {
    expect([...TIPOS_DA_TABELA]).toEqual([CADEIA, CARACTER, INTEIRO, LÓGICO, REAL, VAZIO, "todos"]);
  });

  describe("células que a tabela antiga errava", () => {
    test("retorno de função vazio × vazio é incompatível", () => {
      expect(célulaDaTabela("retornoFuncao", VAZIO, VAZIO)).toBe("incompativel");
    });

    test("inteiro / real resulta em real", () => {
      expect(célulaDaTabela("divisaoMultiplicacaoSubtracao", INTEIRO, REAL)).toBe(REAL);
    });

    test("soma com cadeia resulta em cadeia, venha de onde vier", () => {
      expect(célulaDaTabela("soma", CARACTER, CADEIA)).toBe(CADEIA);
      expect(célulaDaTabela("soma", INTEIRO, CADEIA)).toBe(CADEIA);
      expect(célulaDaTabela("soma", LÓGICO, CADEIA)).toBe(CADEIA);
      expect(célulaDaTabela("soma", REAL, CADEIA)).toBe(CADEIA);
    });

    test("inteiro + real resulta em real", () => {
      expect(célulaDaTabela("soma", INTEIRO, REAL)).toBe(REAL);
    });
  });

  test("o curinga `todos` só casa na passagem de parâmetro e no retorno", () => {
    expect(célulaDaTabela("chamadaFuncao", "todos", INTEIRO)).toBe(INTEIRO);
    expect(célulaDaTabela("retornoFuncao", "todos", CADEIA)).toBe(CADEIA);
    expect(célulaDaTabela("chamadaFuncao", "todos", VAZIO)).toBe("incompativel");
    expect(célulaDaTabela("atribuicao", "todos", INTEIRO)).toBe("incompativel");
  });

  test("a consulta traduz as duas exceções do Java", () => {
    expect(consultarCompatibilidade("atribuicao", INTEIRO, CADEIA)).toEqual({ situação: "incompatível" });

    expect(consultarCompatibilidade("atribuicao", INTEIRO, REAL)).toEqual({
      situação: "conversão",
      de: REAL,
      resultado: INTEIRO,
    });

    expect(consultarCompatibilidade("soma", INTEIRO, CADEIA)).toEqual({ situação: "ok", resultado: CADEIA });
  });

  test("comparações resultam em lógico, não no tipo dos operandos", () => {
    expect(célulaDaTabela("maiorMenor", INTEIRO, REAL)).toBe(LÓGICO);
    expect(célulaDaTabela("diferencaIgualdade", CADEIA, CADEIA)).toBe(LÓGICO);
  });

  test("módulo e bitwise só aceitam inteiro", () => {
    expect(célulaDaTabela("modulo", INTEIRO, INTEIRO)).toBe(INTEIRO);
    expect(célulaDaTabela("modulo", REAL, INTEIRO)).toBe("incompativel");
    expect(célulaDaTabela("bitwise", INTEIRO, INTEIRO)).toBe(INTEIRO);
    expect(célulaDaTabela("bitwise", REAL, INTEIRO)).toBe("incompativel");
  });
});

describe("Tipos das assinaturas de biblioteca", () => {
  test("todo tipo declarado nas bibliotecas é um tipo que o analisador conhece", () => {
    const desconhecidos = new Set<string>();

    const conferir = (tipo: Parameters<typeof tipoDaBiblioteca>[0]) => {
      const convertido = tipoDaBiblioteca(tipo);

      if (!TIPOS_DE_BIBLIOTECA.has(convertido)) {
        desconhecidos.add(tipo.primitivo);
      }
    };

    for (const biblioteca of bibliotecas) {
      for (const constante of biblioteca.constantes) {
        conferir(constante.tipo);
      }

      for (const função of biblioteca.funções) {
        conferir(função.retorno.tipo);

        for (const parâmetro of função.parâmetros) {
          conferir(parâmetro.tipo);
        }
      }
    }

    // Se isto falhar, o recursos ganhou um tipo que o analisador não conhece e
    // `tipoDaBiblioteca` passaria a mentir.
    expect([...desconhecidos]).toEqual([]);
  });
});
