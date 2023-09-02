import { ParserRuleContext } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree.js";
import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";

import { ParseError } from "../helpers/ParseError.js";

export abstract class Node {
  ctx: ParserRuleContext | TerminalNode | ParseTree;
  children: Node[];

  unexpectedChild(child: Node) {
    throw new ParseError(
      `Encontrado ${child.ctx.constructor.name} como filho de ${this.ctx.constructor.name}, não esperado: ${child.ctx.text}`,
      child.ctx,
    );
  }
}
