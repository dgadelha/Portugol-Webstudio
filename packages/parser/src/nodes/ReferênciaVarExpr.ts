import { ReferenciaParaVariavelContext } from "@portugol-webstudio/antlr";

import { EscopoBibliotecaExpr } from "./EscopoBibliotecaExpr.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class ReferênciaVarExpr extends Expressão {
  nome: string;
  escopoBiblioteca?: EscopoBibliotecaExpr;

  constructor(
    public ctx: ReferenciaParaVariavelContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.nome = ctx.ID().text;

    for (const child of children) {
      if (child instanceof EscopoBibliotecaExpr) {
        invariant(!this.escopoBiblioteca, child.ctx, "Escopo de biblioteca já definido");

        this.escopoBiblioteca = child;
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
