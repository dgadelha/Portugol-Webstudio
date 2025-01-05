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

export interface IPortugolErrorCheckerResult {
  parseErrors: PortugolCodeError[];
  errors: PortugolCodeError[];
  tree: ArquivoContext;
}

export class PortugolErrorChecker {
  private static portugolNode = new PortugolNode();

  public static checkCode(code: string): IPortugolErrorCheckerResult {
    const errorListener = new PortugolErrorListener();
    const inputStream = CharStream.fromString(code);
    const lexer = new PortugolLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new PortugolParser(tokenStream);

    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);

    const tree = parser.arquivo();
    const treeResult = this.checkTree(tree);

    return {
      parseErrors: errorListener.getErrors().concat(treeResult.parseErrors),
      errors: treeResult.errors,
      tree,
    };
  }

  private static checkTree(tree: ArquivoContext): IPortugolErrorCheckerResult {
    const errors: PortugolCodeError[] = [];

    try {
      const arquivo = this.portugolNode.visit(tree);

      for (const checker of errorCheckers) {
        for (const error of checker(arquivo)) {
          errors.push(error);
        }
      }

      return {
        parseErrors: [],
        errors,
        tree,
      };
    } catch (error) {
      if (error instanceof ParseError) {
        return {
          parseErrors: [PortugolCodeError.fromContext(error.ctx, error.message)],
          errors,
          tree,
        };
      }

      return {
        parseErrors: [],
        errors: errors.concat(PortugolCodeError.fromContext(tree, String(error))),
        tree,
      };
    }
  }
}
