import { DeclaracaoMatrizContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { getAllChildrenFromContext, invariant } from "../helpers/nodes.js";
import { Expressão } from "./Expressão.js";
import { InicializaçãoMatrizExpr } from "./InicializaçãoMatrizExpr.js";
import { Node } from "./Node.js";

export class DeclaraçãoMatrizExpr extends Expressão<DeclaracaoMatrizContext> {
  nome = this.ctx.ID().getText();
  nomeToken: Token = this.ctx.ID().symbol;

  linhas?: Expressão;
  colunas?: Expressão;
  valor?: InicializaçãoMatrizExpr;

  // As duas dimensões são opcionais na gramática, então a ordem de chegada dos filhos não
  // basta: `inteiro m[][2]` entrega um único filho, e ele é a **coluna**. Daí a
  // discriminação por contexto, como no `para`.
  #linhaCtx = getAllChildrenFromContext(this.ctx.linhaMatriz());
  #colunaCtx = getAllChildrenFromContext(this.ctx.colunaMatriz());

  addChild(child: Node) {
    if (child instanceof InicializaçãoMatrizExpr) {
      invariant(!this.valor, child.ctx, "Valor já definido");
      this.valor = child;
    } else if (child instanceof Expressão && this.#linhaCtx.includes(child.ctx)) {
      invariant(!this.linhas, child.ctx, "Linhas já definidas");
      this.linhas = child;
    } else if (child instanceof Expressão && this.#colunaCtx.includes(child.ctx)) {
      invariant(!this.colunas, child.ctx, "Colunas já definidas");
      this.colunas = child;
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
