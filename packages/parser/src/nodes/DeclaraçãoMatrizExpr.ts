import { DeclaracaoMatrizContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { InicializaçãoMatrizExpr } from "./InicializaçãoMatrizExpr.js";
import { InteiroExpr } from "./InteiroExpr.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";
import { invariant } from "../helpers/nodes.js";

export class DeclaraçãoMatrizExpr extends Expressão {
  nome: string;
  linhas?: InteiroExpr | ReferênciaVarExpr;
  colunas?: InteiroExpr | ReferênciaVarExpr;
  valor?: Expressão;

  constructor(
    public ctx: DeclaracaoMatrizContext,
    public children: Node[],
  ) {
    super(ctx, children);

    this.nome = ctx.ID().text;

    for (const child of children) {
      if (child instanceof InteiroExpr || child instanceof ReferênciaVarExpr) {
        if (!this.linhas) {
          this.linhas = child;
          // eslint-disable-next-line no-negated-condition
        } else if (!this.colunas) {
          this.colunas = child;
        } else {
          this.unexpectedChild(child);
        }
      } else if (child instanceof InicializaçãoMatrizExpr) {
        invariant(!this.valor, child.ctx, "Valor já definido");
        this.valor = child;
      } else {
        this.unexpectedChild(child);
      }
    }
  }
}
