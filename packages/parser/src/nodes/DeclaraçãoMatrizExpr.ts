import { DeclaracaoMatrizContext } from "@portugol-webstudio/antlr";

import { invariant } from "../helpers/nodes.js";
import { ExpressãoMatemática } from "../index.js";
import { Expressão } from "./Expressão.js";
import { InicializaçãoMatrizExpr } from "./InicializaçãoMatrizExpr.js";
import { InteiroExpr } from "./InteiroExpr.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";

export class DeclaraçãoMatrizExpr extends Expressão<DeclaracaoMatrizContext> {
  nome = this.ctx.ID().getText();
  linhas?: InteiroExpr | ReferênciaVarExpr | ExpressãoMatemática;
  colunas?: InteiroExpr | ReferênciaVarExpr | ExpressãoMatemática;
  valor?: Expressão;

  addChild(child: Node) {
    if (child instanceof InteiroExpr || child instanceof ReferênciaVarExpr || child instanceof ExpressãoMatemática) {
      if (!this.linhas) {
        this.linhas = child;
      } else if (this.colunas) {
        this.unexpectedChild(child);
      } else {
        this.colunas = child;
      }
    } else if (child instanceof InicializaçãoMatrizExpr) {
      invariant(!this.valor, child.ctx, "Valor já definido");
      this.valor = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
