import { InclusaoBibliotecaContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class InclusãoBiblioteca extends Node<InclusaoBibliotecaContext> {
  nome: string;
  nomeToken: Token;
  alias?: string;
  aliasToken?: Token;

  constructor(public ctx: InclusaoBibliotecaContext) {
    super(ctx);

    const idCtx = ctx.ID();

    invariant(idCtx.length === 1 || idCtx.length === 2, ctx, "Inclusão de biblioteca inválida");

    this.nome = idCtx[0].getText();
    this.nomeToken = idCtx[0].symbol;

    if (idCtx.length === 2) {
      this.alias = idCtx[1].getText();
      this.aliasToken = idCtx[1].symbol;
    }
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
