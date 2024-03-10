import { EscopoBibliotecaContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { invariant } from "../helpers/nodes.js";

export class EscopoBibliotecaExpr extends Expressão<EscopoBibliotecaContext> {
  nome: string;

  constructor(public ctx: EscopoBibliotecaContext) {
    super(ctx);

    const nome = ctx.ID()?.getText();

    invariant(nome, ctx);

    this.nome = nome;
  }
}
