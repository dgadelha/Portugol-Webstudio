import { ParseTree } from "antlr4ng";

export class ParseError extends Error {
  name = "ParseError";

  constructor(
    public message: string,
    public ctx: ParseTree,
  ) {
    super(message);
  }
}
