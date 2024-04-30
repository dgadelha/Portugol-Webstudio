import { Tipo, TipoPrimitivo } from "./Tipo.js";

interface IEscopo {
  variáveis: Map<string, Tipo>;
  funções: Map<string, Tipo>;
  função?: Tipo;
}

export class Escopo {
  private pilha: IEscopo[] = [];

  constructor(
    inicial: IEscopo = {
      variáveis: new Map(),
      funções: new Map([
        ["escreva", { primitivo: TipoPrimitivo.VAZIO }],
        ["leia", { primitivo: TipoPrimitivo.CADEIA }],
        ["limpa", { primitivo: TipoPrimitivo.VAZIO }],
      ]),
    },
  ) {
    this.pilha.push(inicial);
  }

  push() {
    this.pilha.push({
      variáveis: new Map(),
      funções: new Map(),
      função: this.atual.função,
    });
  }

  pop() {
    if (this.pilha.length === 1) {
      throw new Error("Não é possível remover o escopo global");
    }

    this.pilha.pop();
  }

  get atual(): IEscopo {
    return this.pilha.at(-1)!;
  }

  get global(): IEscopo {
    return this.pilha[0];
  }

  get variáveis() {
    return this.atual.variáveis;
  }

  get funções() {
    return this.atual.funções;
  }

  get função(): Tipo | undefined {
    return this.atual.função;
  }

  set função(tipo: Tipo) {
    this.atual.função = tipo;
  }

  hasVariável(nome: string) {
    for (const escopo of this.pilha) {
      if (escopo.variáveis.has(nome)) {
        return true;
      }
    }

    return false;
  }

  hasFunção(nome: string) {
    for (const escopo of this.pilha) {
      if (escopo.funções.has(nome)) {
        return true;
      }
    }

    return false;
  }

  getVariável(nome: string) {
    for (const escopo of this.pilha) {
      if (escopo.variáveis.has(nome)) {
        return escopo.variáveis.get(nome);
      }
    }

    return this.variáveis.get(nome);
  }

  getFunção(nome: string) {
    for (const escopo of this.pilha) {
      if (escopo.funções.has(nome)) {
        return escopo.funções.get(nome);
      }
    }

    return this.funções.get(nome);
  }
}
