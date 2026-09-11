import { PortugolCodeDiagnostic, PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { ParserRuleContext, ParseTree, TerminalNode, Token } from "antlr4ng";

/**
 * O `{ ctx }` é um nó da nossa árvore; os outros dois vêm direto do ANTLR.
 */
export type Origem = ParseTree | Token | { ctx: ParseTree };

function alvoDe(origem: Origem): ParseTree | Token {
  return "ctx" in origem ? origem.ctx : origem;
}

function éToken(alvo: ParseTree | Token): alvo is Token {
  return typeof (alvo as Token).line === "number" && typeof (alvo as Token).column === "number";
}

function extremos(origem: Origem): { fim: Token; início: Token } | undefined {
  const alvo = alvoDe(origem);

  if (alvo instanceof ParserRuleContext) {
    return alvo.start ? { início: alvo.start, fim: alvo.stop ?? alvo.start } : undefined;
  }

  if (alvo instanceof TerminalNode) {
    return { início: alvo.symbol, fim: alvo.symbol };
  }

  return éToken(alvo) ? { início: alvo, fim: alvo } : undefined;
}

export function diagnóstico(
  origem: Origem,
  mensagem: string,
  severidade: PortugolDiagnosticSeverity,
  código: string,
): PortugolCodeDiagnostic {
  const trecho = extremos(origem);

  if (!trecho) {
    return PortugolCodeDiagnostic.fromContext(alvoDe(origem) as ParseTree, mensagem, severidade, código);
  }

  return PortugolCodeDiagnostic.fromTokens(trecho.início, trecho.fim, mensagem, severidade, código);
}

/**
 * Existe para o caso em que o Portugol Studio reporta a linha/coluna de uma subexpressão
 * mas marca o trecho do nó inteiro.
 */
export function diagnósticoEntre(
  início: Origem,
  fim: Origem,
  mensagem: string,
  severidade: PortugolDiagnosticSeverity,
  código: string,
): PortugolCodeDiagnostic {
  const a = extremos(início);
  const b = extremos(fim);

  if (!a) {
    return diagnóstico(fim, mensagem, severidade, código);
  }

  return PortugolCodeDiagnostic.fromTokens(a.início, b?.fim ?? a.fim, mensagem, severidade, código);
}

export function erro(origem: Origem, mensagem: string, código: string): PortugolCodeDiagnostic {
  return diagnóstico(origem, mensagem, PortugolDiagnosticSeverity.Error, código);
}

export function aviso(origem: Origem, mensagem: string, código: string): PortugolCodeDiagnostic {
  return diagnóstico(origem, mensagem, PortugolDiagnosticSeverity.Warning, código);
}

export function informação(origem: Origem, mensagem: string, código: string): PortugolCodeDiagnostic {
  return diagnóstico(origem, mensagem, PortugolDiagnosticSeverity.Information, código);
}

export function textoDe(origem: Origem): string {
  const alvo = alvoDe(origem);

  if (éToken(alvo)) {
    return alvo.text ?? "";
  }

  return alvo.getText();
}
