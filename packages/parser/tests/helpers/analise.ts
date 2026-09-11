import type { PortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { expect } from "vitest";

import type { IPortugolCodeCheckerOptions } from "../../src";
import { PortugolCodeChecker } from "../../src";

/**
 * Um `parseError` inesperado falha o teste em vez de virar resultado. Os avisos de uso vêm
 * desligados: aparecem em quase todo programa pequeno e afogariam os snapshots dos outros
 * grupos.
 */
export function analisar(código: string, opções: IPortugolCodeCheckerOptions = {}): PortugolCodeDiagnostic[] {
  const resultado = PortugolCodeChecker.checkCode(código, { avisosDeUso: false, ...opções });

  expect(resultado.parseErrors.map(erro => `${erro.startLine}: ${erro.message}`)).toEqual([]);

  return resultado.diagnostics;
}

export function analisarComAvisosDeUso(código: string): PortugolCodeDiagnostic[] {
  return analisar(código, { avisosDeUso: true });
}

export function erros(código: string): PortugolCodeDiagnostic[] {
  return analisar(código).filter(diagnóstico => diagnóstico.severity === PortugolDiagnosticSeverity.Error);
}
