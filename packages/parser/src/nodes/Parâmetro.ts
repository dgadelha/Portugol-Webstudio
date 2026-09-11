import { ParametroArrayContext, ParametroContext, ParametroMatrizContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { Tipo, parseTipoPrimitivo } from "../analise/TipoDado.js";
import { invariant } from "../helpers/nodes.js";
import { Node } from "./Node.js";
import { UnhandledNode } from "./UnhandledNode.js";

export class Parâmetro extends Node<ParametroContext> {
  nome: string;
  nomeToken: Token;
  tipo: Tipo = { primitivo: parseTipoPrimitivo(this.ctx.TIPO()) };
  referência = Boolean(this.ctx.E_COMERCIAL());

  constructor(public ctx: ParametroContext) {
    super(ctx);

    const id = ctx.ID();

    invariant(id, ctx, "Parâmetro sem nome");

    this.nome = id.getText();
    this.nomeToken = id.symbol;
  }

  addChild(child: Node) {
    if (child instanceof UnhandledNode) {
      if (child.ctx instanceof ParametroArrayContext && !this.tipo.dimensão) {
        this.tipo = {
          dimensão: "vetor",
          primitivo: this.tipo.primitivo,
        };
      } else if (child.ctx instanceof ParametroMatrizContext && !this.tipo.dimensão) {
        this.tipo = {
          dimensão: "matriz",
          primitivo: this.tipo.primitivo,
        };
      } else {
        this.unexpectedChild(child);
      }
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
