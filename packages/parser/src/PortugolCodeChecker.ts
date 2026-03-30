import {
  ArquivoContext,
  PortugolCodeDiagnostic,
  PortugolErrorListener,
  PortugolLexer,
  PortugolParser,
} from "@portugol-webstudio/antlr";
import { CharStream, CommonTokenStream } from "antlr4ng";

import codeCheckers from "./checkers/index.js";
import { ParseError } from "./helpers/ParseError.js";
import { PortugolNode } from "./PortugolNode.js";

export interface IPortugolCodeCheckerResult {
  parseErrors: PortugolCodeDiagnostic[];
  diagnostics: PortugolCodeDiagnostic[];
  tree: ArquivoContext;
}

export class PortugolCodeChecker {
  private static portugolNode = new PortugolNode();

  public static checkCode(code: string): IPortugolCodeCheckerResult {
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
      diagnostics: treeResult.diagnostics,
      tree,
    };
  }

  private static checkTree(tree: ArquivoContext): IPortugolCodeCheckerResult {
    const diagnostics: PortugolCodeDiagnostic[] = [];

    try {
      const arquivo = this.portugolNode.visit(tree);

      for (const checker of codeCheckers) {
        for (const error of checker(arquivo)) {
          diagnostics.push(error);
        }
      }

      return {
        parseErrors: [],
        diagnostics,
        tree,
      };
    } catch (error) {
      if (error instanceof ParseError) {
        return {
          parseErrors: [PortugolCodeDiagnostic.fromContext(error.ctx, error.message)],
          diagnostics,
          tree,
        };
      }

      return {
        parseErrors: [],
        diagnostics: diagnostics.concat(PortugolCodeDiagnostic.fromContext(tree, String(error))),
        tree,
      };
    }
  }
}
