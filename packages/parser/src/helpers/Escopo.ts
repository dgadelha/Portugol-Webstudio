import type { Node } from "../nodes/Node.js";
import { Parâmetro } from "../nodes/Parâmetro.js";
import { Tipo, TipoPrimitivo } from "./Tipo.js";

interface IVariável {
  nome: string;
  tipo: Tipo;
  declaração?: Node;
  leitura: Node[];
  escrita: Node[];
}

interface IParâmetro {
  nome: string;
  tipo?: Tipo;
  referência: boolean;
  declaração?: Parâmetro;
  leitura: Node[];
}

interface IFunção {
  nome: string;
  parâmetros: IParâmetro[] | undefined /* undefined age como 'any' */;
  retorno: Tipo | undefined /* undefined age como 'any' */;
  declaração?: Node;
  chamadas: Node[];
}

interface IEscopo {
  variáveis: Map<string, IVariável>;
  funções: Map<string, IFunção>;
  função?: Tipo;
}

export class Escopo {
  private pilha: IEscopo[] = [];

  constructor(
    inicial: IEscopo = {
      variáveis: new Map(),
      funções: new Map<string, IFunção>([
        [
          "escreva",
          {
            nome: "escreva",
            parâmetros: undefined,
            retorno: { primitivo: TipoPrimitivo.VAZIO },
            declaração: undefined,
            chamadas: [],
          },
        ],
        [
          "leia",
          {
            nome: "leia",
            retorno: undefined,
            parâmetros: [
              {
                nome: "variável",
                tipo: undefined,
                referência: true,
                declaração: undefined,
                leitura: [],
              },
            ],
            declaração: undefined,
            chamadas: [],
          },
        ],
        [
          "limpa",
          {
            nome: "limpa",
            parâmetros: [],
            retorno: { primitivo: TipoPrimitivo.VAZIO },
            declaração: undefined,
            chamadas: [],
          },
        ],
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

  set função(tipo: Tipo | undefined) {
    this.atual.função = tipo;
  }

  hasVariável(nome: string) {
    for (let i = this.pilha.length - 1; i >= 0; i--) {
      if (this.pilha[i].variáveis.has(nome)) {
        return true;
      }
    }

    return false;
  }

  hasFunção(nome: string) {
    for (let i = this.pilha.length - 1; i >= 0; i--) {
      if (this.pilha[i].funções.has(nome)) {
        return true;
      }
    }

    return false;
  }

  getVariável(nome: string) {
    for (let i = this.pilha.length - 1; i >= 0; i--) {
      if (this.pilha[i].variáveis.has(nome)) {
        return this.pilha[i].variáveis.get(nome);
      }
    }

    return this.variáveis.get(nome);
  }

  getFunção(nome: string) {
    for (let i = this.pilha.length - 1; i >= 0; i--) {
      if (this.pilha[i].funções.has(nome)) {
        return this.pilha[i].funções.get(nome);
      }
    }

    return this.funções.get(nome);
  }
}
