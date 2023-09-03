import { DeclaracaoFuncaoContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { Parâmetro } from "./Parâmetro.js";
import { Tipo, parseTipoPrimitivo } from "../helpers/Tipo.js";

export class Função extends Node {
  nome: string;
  parâmetros: Parâmetro[] = [];
  retorno: Tipo;
  instruções: Array<Expressão | Comando> = [];

  constructor(
    public ctx: DeclaracaoFuncaoContext,
    public children: Node[],
  ) {
    super();

    this.nome = ctx.ID().text;
    this.retorno = { primitivo: parseTipoPrimitivo(ctx.TIPO()) };

    for (const child of children) {
      if (child instanceof Parâmetro) {
        this.parâmetros.push(child);
      } else if (child instanceof Expressão || child instanceof Comando) {
        this.instruções.push(child);
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
