import { ParserRuleContext } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree.js";
import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";

import { ParseError } from "../helpers/ParseError.js";

export abstract class Node {
  ctx: ParserRuleContext | TerminalNode | ParseTree;
  children: Node[];

  unexpectedChild(child: Node) {
    const childName = child.ctx.constructor.name.replace("Context", "");
    const parentName = this.ctx.constructor.name.replace("Context", "");

    if (childName === "ErrorNode") {
      throw new ParseError(`Expressão inválida: ${child.ctx.text}`, child.ctx);
    }

    throw new ParseError(
      `Encontrado '${childName}' como filho de '${parentName}', não esperado: '${child.ctx.text}'`,
      child.ctx,
    );
  }
}
