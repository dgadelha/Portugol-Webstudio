import { ParseTree } from "antlr4ng";

import { ParseError } from "../helpers/ParseError.js";

export abstract class Node<T extends ParseTree = ParseTree> {
  children: Node[] = [];

  constructor(public ctx: T) {}

  unexpectedChild(child: Node): never {
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

  addChild(child: Node) {
    this.children.push(child);
  }
}
