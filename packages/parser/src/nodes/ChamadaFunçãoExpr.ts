import { ChamadaFuncaoContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { AtribuiçãoCmd } from "./AtribuiçãoCmd.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class ChamadaFunçãoExpr extends Expressão<ChamadaFuncaoContext> {
  nome = this.ctx.ID().getText();
  nomeToken: Token = this.ctx.ID().symbol;
  argumentos: Array<AtribuiçãoCmd | Expressão> = [];
  escopoBiblioteca?: string = this.ctx.escopoBiblioteca()?.ID()?.getText();

  addChild(child: Node) {
    if (child instanceof Expressão || child instanceof AtribuiçãoCmd) {
      this.argumentos.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
