import { DeclaracaoArrayContext } from "@portugol-webstudio/antlr";

import { invariant } from "../helpers/nodes.js";
import { Expressão } from "./Expressão.js";
import { ExpressãoMatemática } from "./ExpressãoMatemática.js";
import { InicializaçãoVetorExpr } from "./InicializaçãoVetorExpr.js";
import { InteiroExpr } from "./InteiroExpr.js";
import { Node } from "./Node.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";

export class DeclaraçãoVetorExpr extends Expressão<DeclaracaoArrayContext> {
  nome = this.ctx.ID().getText();
  tamanho?: InteiroExpr | ReferênciaVarExpr | ExpressãoMatemática;
  valor?: Expressão;

  addChild(child: Node) {
    if (child instanceof InteiroExpr || child instanceof ReferênciaVarExpr || child instanceof ExpressãoMatemática) {
      invariant(!this.tamanho, child.ctx, "Tamanho já definido");
      this.tamanho = child;
    } else if (child instanceof InicializaçãoVetorExpr) {
      invariant(!this.valor, child.ctx, "Inicialização já definida");
      this.valor = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
