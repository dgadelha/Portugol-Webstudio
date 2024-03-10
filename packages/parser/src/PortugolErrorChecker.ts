import {
  ArquivoContext,
  PortugolCodeError,
  PortugolErrorListener,
  PortugolLexer,
  PortugolParser,
} from "@portugol-webstudio/antlr";
import { CharStream, CommonTokenStream } from "antlr4ng";

import errorCheckers from "./errors/index.js";
import { ParseError } from "./helpers/ParseError.js";
import { PortugolNode } from "./PortugolNode.js";

export class PortugolErrorChecker {
  private static portugolNode = new PortugolNode();
  private static errorListener = new PortugolErrorListener();

  public static checkCode(code: string): PortugolCodeError[] {
    const inputStream = CharStream.fromString(code);
    const lexer = new PortugolLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new PortugolParser(tokenStream);
    const tree = parser.arquivo();

    parser.addErrorListener(this.errorListener);

    return this.checkTree(tree);
  }

  public static checkTree(tree: ArquivoContext): PortugolCodeError[] {
    this.errorListener.reset();

    try {
      const arquivo = this.portugolNode.visit(tree);
      const errors: PortugolCodeError[] = [];

      for (const checker of errorCheckers) {
        for (const error of checker(arquivo)) {
          errors.push(error);
        }
      }

      return this.errorListener.getErrors().concat(errors);
    } catch (error) {
      if (error instanceof ParseError) {
        return this.errorListener.getErrors().concat(PortugolCodeError.fromContext(error.ctx, error.message));
      }

      return this.errorListener.getErrors().concat(PortugolCodeError.fromContext(tree, String(error)));
    }
  }
}
