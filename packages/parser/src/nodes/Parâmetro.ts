import { ParametroContext, ParametroArrayContext, ParametroMatrizContext } from "@portugol-webstudio/antlr";

import { Node } from "./Node.js";
import { UnhandledNode } from "./UnhandledNode.js";
import { invariant } from "../helpers/nodes.js";
import { Tipo, parseTipoPrimitivo } from "../helpers/Tipo.js";

export class Parâmetro extends Node {
  nome: string;
  tipo: Tipo;
  referência: boolean;

  constructor(
    public ctx: ParametroContext,
    public children: Node[],
  ) {
    super();

    this.nome = ctx.ID().text;

    this.tipo = { primitivo: parseTipoPrimitivo(ctx.TIPO()) };
    this.referência = Boolean(ctx.E_COMERCIAL());

    if (children.length === 1) {
      const child = children[0];

      invariant(child instanceof UnhandledNode, child.ctx, "Parâmetro inválido");
    }

    for (const child of children) {
      if (child instanceof UnhandledNode) {
        if (child.ctx instanceof ParametroArrayContext && !this.tipo.hasOwnProperty("dimensão")) {
          this.tipo = {
            dimensão: "vetor",
            primitivo: this.tipo.primitivo,
          };
        } else if (child.ctx instanceof ParametroMatrizContext && !this.tipo.hasOwnProperty("dimensão")) {
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
    }
  }
}
