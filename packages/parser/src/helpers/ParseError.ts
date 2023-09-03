import { ParseTree } from "antlr4ts/tree/ParseTree.js";

export class ParseError extends Error {
  constructor(
    public message: string,
    public ctx: ParseTree,
  ) {
    super(message);
  }
}
