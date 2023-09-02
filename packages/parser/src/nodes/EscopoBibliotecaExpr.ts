import { EscopoBibliotecaContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class EscopoBibliotecaExpr extends Expressão {
  nome: string;

  constructor(
    public ctx: EscopoBibliotecaContext,
    public children: Node[],
  ) {
    super(ctx, children);

    const nome = ctx.ID()?.text;

    invariant(nome, ctx);

    this.nome = nome;
  }
}
