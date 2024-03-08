import { ParseTree } from "antlr4ng";

export class ParseError extends Error {
  constructor(
    public message: string,
    public ctx: ParseTree,
  ) {
    super(message);
  }
}
