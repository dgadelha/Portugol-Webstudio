import { ArquivoContext, PortugolCodeDiagnostic } from "@portugol-webstudio/antlr";

import { analisar, type OpçõesAnálise } from "./analise/AnalisadorSemântico.js";
import { analisarSintaxe } from "./analise/AnalisadorSintático.js";
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
    const { árvore: tree, erros } = analisarSintaxe(code);

    // Como no Portugol Studio, com erro de sintaxe não há análise semântica: a árvore é a que
    // o ANTLR remendou para seguir em frente, e tudo o que se achasse nela seria consequência
    // do primeiro erro.
    if (erros.length > 0) {
      return { parseErrors: erros, diagnostics: [], tree };
    }

    return this.checkTree(tree, options);
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
