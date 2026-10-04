import { IPortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import { PortugolCodeChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";

export interface PortugolTranspiledCode {
  js: string;
  diagnostics: IPortugolCodeDiagnostic[];
  parseErrors: IPortugolCodeDiagnostic[];
  times: { check: number; transpile: number };
}

/**
 * Analisa e transpila o código, no formato que o `PortugolExecutor.runTranspiled` recebe.
 *
 * Fica fora do executor para quem só executa código já transpilado (o IDE, que transpila
 * no worker) não levar o analisador e o transpilador junto.
 */
export function transpile(code: string): PortugolTranspiledCode {
  let diagnostics: IPortugolCodeDiagnostic[] = [];
  let parseErrors: IPortugolCodeDiagnostic[] = [];
  let js = "";
  let checkStart = 0;
  let checkEnd = 0;
  let transpileStart = 0;
  let transpileEnd = 0;

  try {
    checkStart = performance.now();
    const checkResult = PortugolCodeChecker.checkCode(code);

    diagnostics = checkResult.diagnostics;
    parseErrors = checkResult.parseErrors;

    checkEnd = performance.now();

    transpileStart = performance.now();
    js = new PortugolJs().visit(checkResult.tree)!;
    transpileEnd = performance.now();
  } catch {}

  return {
    js,
    diagnostics,
    parseErrors,
    times: {
      check: checkEnd - checkStart,
      transpile: transpileEnd - transpileStart,
    },
  };
}
