import { ParseTree } from "antlr4ng";

import { ParseError } from "../helpers/ParseError.js";

/**
 * `abstract new` para as tabelas poderem casar também as classes-base (`ExpressãoMatemática`).
 */
export type Construtor = abstract new (...args: any[]) => Node;

export abstract class Node<T extends ParseTree = ParseTree> {
  children: Node[] = [];

  constructor(public ctx: T) {}

  unexpectedChild(child: Node): never {
    const childName = child.ctx.constructor.name.replace("Context", "");

    if (childName === "ErrorNode") {
      throw new ParseError(`Expressão inválida: ${child.ctx.getText()}`, child.ctx);
    }

    const parentName = this.ctx.constructor.name.replace("Context", "");

    console.error(
      new Error(`Encontrado '${childName}' como filho de '${parentName}', não esperado: '${child.ctx.getText()}'`),
    );

    throw new ParseError(
      `Encontrado '${childName}' como filho de '${parentName}', não esperado: '${child.ctx.getText()}'`,
      child.ctx,
    );
  }

  addChild(child: Node) {
    this.children.push(child);
  }
}
