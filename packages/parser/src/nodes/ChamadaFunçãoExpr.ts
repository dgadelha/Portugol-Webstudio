import { ChamadaFuncaoContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class ChamadaFunçãoExpr extends Expressão {
  nome: string;
  argumentos: Expressão[] = [];
  escopoBiblioteca?: string;

  constructor(
    public ctx: ChamadaFuncaoContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.nome = ctx.ID().text;
    this.escopoBiblioteca = ctx.escopoBiblioteca()?.ID()?.text;

    for (const child of children) {
      if (child instanceof Expressão) {
        this.argumentos.push(child);
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
