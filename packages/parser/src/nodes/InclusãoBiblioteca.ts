import { InclusaoBibliotecaContext } from "@portugol-webstudio/antlr";

import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class InclusãoBiblioteca extends Node<InclusaoBibliotecaContext> {
  nome: string;
  alias?: string;

  constructor(public ctx: InclusaoBibliotecaContext) {
    super(ctx);

    const idCtx = ctx.ID();

    invariant(idCtx.length === 1 || idCtx.length === 2, ctx, "Inclusão de biblioteca inválida");

    this.nome = idCtx[0].getText();

    if (idCtx.length === 2) {
      this.alias = idCtx[1].getText();
    }
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
