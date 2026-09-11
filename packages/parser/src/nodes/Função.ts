import { DeclaracaoFuncaoContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { Tipo, parseTipoPrimitivo } from "../analise/TipoDado.js";
import { Comando } from "./Comando.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { Parâmetro } from "./Parâmetro.js";

export class Função extends Node<DeclaracaoFuncaoContext> {
  nome = this.ctx.ID().getText();
  nomeToken: Token = this.ctx.ID().symbol;
  parâmetros: Parâmetro[] = [];
  retorno: Tipo = { primitivo: parseTipoPrimitivo(this.ctx.TIPO()) };
  instruções: Array<Expressão | Comando> = [];

  addChild(child: Node) {
    if (child instanceof Parâmetro) {
      this.parâmetros.push(child);
    } else if (child instanceof Expressão || child instanceof Comando) {
      this.instruções.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
