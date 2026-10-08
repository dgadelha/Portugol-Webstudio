import { CaracterContext } from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class CaractereExpr extends Expressão<CaracterContext> {
  conteúdo: string;

  constructor(public ctx: CaracterContext) {
    super(ctx);

    // O léxico só aceita um caractere ou uma sequência de escape, como '\n' ou '\u0041'. O Portugol Studio aceita
    // as duas formas (e a execução usa o primeiro caractere, ver o `visitCaracter` do runtime), então aqui não há o
    // que verificar: exigir um caractere só recusava '\n' e emojis, que ocupam dois.
    this.conteúdo = ctx.CARACTER().getText().slice(1, -1);
  }

  addChild(child: Node) {
    this.unexpectedChild(child);
  }
}
