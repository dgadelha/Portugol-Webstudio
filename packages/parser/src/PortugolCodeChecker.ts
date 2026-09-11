import {
  ArquivoContext,
  PortugolCodeDiagnostic,
  PortugolErrorListener,
  PortugolLexer,
  PortugolParser,
} from "@portugol-webstudio/antlr";
import { CharStream, CommonTokenStream } from "antlr4ng";

import { analisar, type OpçõesAnálise } from "./analise/AnalisadorSemântico.js";
import { ParseError } from "./helpers/ParseError.js";
import { PortugolNode } from "./PortugolNode.js";

export interface IPortugolCodeCheckerResult {
  parseErrors: PortugolCodeDiagnostic[];
  diagnostics: PortugolCodeDiagnostic[];
  tree: ArquivoContext;
}

export type IPortugolCodeCheckerOptions = OpçõesAnálise;

export class PortugolCodeChecker {
  private static portugolNode = new PortugolNode();

  public static checkCode(code: string, options?: IPortugolCodeCheckerOptions): IPortugolCodeCheckerResult {
    const errorListener = new PortugolErrorListener();
    const inputStream = CharStream.fromString(code);
    const lexer = new PortugolLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new PortugolParser(tokenStream);

    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);

    const tree = parser.arquivo();
    const treeResult = this.checkTree(tree, options);

    return {
      parseErrors: errorListener.getErrors().concat(treeResult.parseErrors),
      diagnostics: treeResult.diagnostics,
      tree,
    };
  }

  private static checkTree(tree: ArquivoContext, options?: IPortugolCodeCheckerOptions): IPortugolCodeCheckerResult {
    try {
      const arquivo = this.portugolNode.visit(tree);

      return {
        parseErrors: [],
        diagnostics: analisar(arquivo, options),
        tree,
      };
    } catch (error) {
      if (error instanceof ParseError) {
        return {
          parseErrors: [PortugolCodeDiagnostic.fromContext(error.ctx, error.message)],
          diagnostics: [],
          tree,
        };
      }

      // Exceção inesperada ao montar os nós é bug nosso, não diagnóstico semântico: vai
      // para `parseErrors` para não virar um marcador de erro sobre o programa inteiro.
      return {
        parseErrors: [PortugolCodeDiagnostic.fromContext(tree, String(error))],
        diagnostics: [],
        tree,
      };
    }
  }
}
