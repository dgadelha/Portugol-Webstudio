import { ParseTree, ParserRuleContext, TerminalNode } from "antlr4ng";

import { ParseError } from "../helpers/ParseError.js";

export abstract class Node {
  ctx: ParserRuleContext | TerminalNode | ParseTree;
  children: Node[];

  unexpectedChild(child: Node) {
    const childName = child.ctx.constructor.name.replace("Context", "");
    const parentName = this.ctx.constructor.name.replace("Context", "");

    if (childName === "ErrorNode") {
      throw new ParseError(`Expressão inválida: ${child.ctx.getText()}`, child.ctx);
    }

    throw new ParseError(
      `Encontrado '${childName}' como filho de '${parentName}', não esperado: '${child.ctx.getText()}'`,
      child.ctx,
    );
  }
}
