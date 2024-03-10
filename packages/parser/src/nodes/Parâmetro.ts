import { ParametroContext, ParametroArrayContext, ParametroMatrizContext } from "@portugol-webstudio/antlr";

import { Node } from "./Node.js";
import { UnhandledNode } from "./UnhandledNode.js";
import { Tipo, parseTipoPrimitivo } from "../helpers/Tipo.js";

export class Parâmetro extends Node<ParametroContext> {
  nome = this.ctx.ID().getText();
  tipo: Tipo = { primitivo: parseTipoPrimitivo(this.ctx.TIPO()) };
  referência = Boolean(this.ctx.E_COMERCIAL());

  addChild(child: Node) {
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

    this.children.push(child);
  }
}
