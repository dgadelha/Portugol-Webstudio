import {
  DecrementoUnarioPosfixadoContext,
  DecrementoUnarioPrefixadoContext,
  IncrementoUnarioPosfixadoContext,
  IncrementoUnarioPrefixadoContext,
} from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { ÍndiceArrayExpr } from "./ÍndiceArrayExpr.js";

export class ExpressãoUnária<
  T extends
    | DecrementoUnarioPosfixadoContext
    | DecrementoUnarioPrefixadoContext
    | IncrementoUnarioPrefixadoContext
    | IncrementoUnarioPosfixadoContext,
> extends Expressão<T> {
  nome = this.ctx.ID().getText();
  nomeToken: Token = this.ctx.ID().symbol;

  índices: ÍndiceArrayExpr[] = [];

  addChild(child: Node) {
    if (child instanceof ÍndiceArrayExpr) {
      this.índices.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
