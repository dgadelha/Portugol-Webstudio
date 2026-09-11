import { describe, expect, test } from "vitest";

import { criarDado, criarFunção, Memória, TipoPrimitivo } from "../../src";

function variável(nome: string) {
  return criarDado("variável", nome, TipoPrimitivo.INTEIRO);
}

describe("Memória", () => {
  test("escopo global: símbolo declarado fica visível", () => {
    const memória = new Memória();
    const x = variável("x");

    memória.adicionarSímbolo(x);

    expect(memória.obterSímbolo("x")).toBe(x);
    expect(memória.éEscopoGlobal()).toBe(true);
    expect(memória.éGlobal(x)).toBe(true);
    expect(memória.éLocal(x)).toBe(false);
  });

  test("dentro de uma função, o global continua visível e o local tem precedência", () => {
    const memória = new Memória();
    const global = variável("x");
    const local = variável("x");

    memória.adicionarSímbolo(global);
    memória.empilharFunção();

    expect(memória.obterSímbolo("x")).toBe(global);
    expect(memória.éEscopoGlobal()).toBe(false);
    expect(memória.éLocal(global)).toBe(false);

    memória.adicionarSímbolo(local);

    expect(memória.obterSímbolo("x")).toBe(local);
    expect(memória.éLocal(local)).toBe(true);
    expect(memória.éGlobal(local)).toBe(false);

    memória.desempilharFunção();

    expect(memória.obterSímbolo("x")).toBe(global);
  });

  test("sub-escopos: obter procura do mais interno para o mais externo", () => {
    const memória = new Memória();
    const externo = variável("k");
    const interno = variável("k");

    memória.empilharFunção();
    memória.adicionarSímbolo(externo);
    memória.empilharEscopo();
    memória.adicionarSímbolo(interno);

    expect(memória.obterSímbolo("k")).toBe(interno);

    memória.desempilharEscopo();

    expect(memória.obterSímbolo("k")).toBe(externo);
  });

  test("um símbolo só existe no sub-escopo em que foi declarado", () => {
    const memória = new Memória();

    memória.empilharFunção();
    memória.empilharEscopo();
    memória.adicionarSímbolo(variável("i"));
    memória.desempilharEscopo();

    expect(memória.obterSímbolo("i")).toBeUndefined();
  });

  /**
   * É este par de predicados que separa redeclaração de ocultação: o analisador empilha um
   * sub-escopo, adiciona o símbolo novo e compara de que nível cada um é visível.
   */
  describe("redeclaração × ocultação", () => {
    test("mesmo escopo global: os dois são globais → redeclaração", () => {
      const memória = new Memória();
      const antigo = variável("x");
      const novo = variável("x");

      memória.adicionarSímbolo(antigo);

      const global = memória.éGlobal(antigo);
      const local = memória.éLocal(antigo);

      memória.empilharEscopo();
      memória.adicionarSímbolo(novo);

      expect(global && memória.éGlobal(novo)).toBe(true);
      expect(local && memória.éLocal(novo)).toBe(false);
    });

    test("declaração local sobre um global: ocultação, não redeclaração", () => {
      const memória = new Memória();
      const antigo = variável("n");
      const novo = variável("n");

      memória.adicionarSímbolo(antigo);
      memória.empilharFunção();

      const global = memória.éGlobal(antigo);
      const local = memória.éLocal(antigo);

      memória.empilharEscopo();
      memória.adicionarSímbolo(novo);

      expect(global && memória.éGlobal(novo)).toBe(false);
      expect(local && memória.éLocal(novo)).toBe(false);
    });

    test("declaração em bloco sobre um local da mesma função: redeclaração", () => {
      const memória = new Memória();
      const antigo = variável("x");
      const novo = variável("x");

      memória.empilharFunção();
      memória.adicionarSímbolo(antigo);

      const global = memória.éGlobal(antigo);
      const local = memória.éLocal(antigo);

      memória.empilharEscopo();
      memória.adicionarSímbolo(novo);

      expect(global && memória.éGlobal(novo)).toBe(false);
      expect(local && memória.éLocal(novo)).toBe(true);
    });
  });

  test("desempilharEscopo desempilha mesmo no escopo global", () => {
    // Divergência deliberada: o `Memoria.desempilharEscopo()` do Portugol Studio chama
    // `empilharEscopo()` no ramo global, e por isso uma redeclaração global recusada
    // continua visível lá.
    const memória = new Memória();
    const antigo = criarFunção("f", TipoPrimitivo.VAZIO);
    const novo = variável("f");

    memória.adicionarSímbolo(antigo);
    memória.empilharEscopo();
    memória.adicionarSímbolo(novo);
    memória.desempilharEscopo();

    expect(memória.obterSímbolo("f")).toBe(antigo);
  });
});
