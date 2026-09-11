import {
  ANTLRErrorListener,
  ATNConfigSet,
  ATNSimulator,
  BitSet,
  DFA,
  Parser,
  ParserRuleContext,
  ParseTree,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4ng";

export enum PortugolDiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
}

export interface IPortugolCodeDiagnostic {
  severity: PortugolDiagnosticSeverity;
  message: string;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  code?: string;
}

/**
 * O token isolado é para quando o diagnóstico aponta exatamente o nome de um símbolo.
 */
export type PortugolDiagnosticContext = ParseTree | Token;

export class PortugolCodeDiagnostic extends Error implements IPortugolCodeDiagnostic {
  constructor(
    public readonly severity: PortugolDiagnosticSeverity,
    public readonly message: string,
    public readonly context: PortugolDiagnosticContext,
    public readonly startLine: number,
    public readonly startCol: number,
    public readonly endLine: number,
    public readonly endCol: number,
    public readonly code?: string,
  ) {
    super(message);
  }

  static fromTokens(
    start: Token,
    stop: Token,
    message: string,
    severity: PortugolDiagnosticSeverity = PortugolDiagnosticSeverity.Error,
    code?: string,
  ) {
    // `endCol` é a coluna (base 0) do último caractere, *inclusive*: é o que a IDE assume ao
    // converter para o intervalo do Monaco, que é exclusivo e base 1 (`endCol + 2`).
    const endCol = stop.column + Math.max((stop.text ?? "").length, 1) - 1;

    return new PortugolCodeDiagnostic(severity, message, start, start.line, start.column, stop.line, endCol, code);
  }

  static fromContext(
    ctx: ParseTree,
    message: string,
    severity: PortugolDiagnosticSeverity = PortugolDiagnosticSeverity.Error,
    code?: string,
  ) {
    let possibleContext = ctx;

    if (
      typeof ctx === "object" &&
      ctx !== null &&
      !Object.hasOwn(ctx, "start") &&
      !Object.hasOwn(ctx, "stop") &&
      Object.hasOwn(ctx, "parent") &&
      typeof ctx.parent === "object" &&
      ctx.parent !== null
    ) {
      possibleContext = ctx.parent;
    }

    if (!possibleContext) {
      return new PortugolCodeDiagnostic(severity, message, ctx, 1, 0, 9999, 0, code);
    }

    if (
      Object.hasOwn(possibleContext, "start") &&
      Object.hasOwn(possibleContext, "stop") &&
      typeof (possibleContext as unknown as { start: unknown }).start === "object" &&
      (possibleContext as unknown as { start: unknown }).start !== null
    ) {
      const { start, stop } = possibleContext as unknown as { start: Token; stop?: Token };
      const { line: startLine, column: startCol } = start;

      if (typeof stop === "object" && stop !== null) {
        let { line: endLine, column: endCol } = stop;

        if (startLine === endLine && startCol === endCol) {
          endCol += ctx.getText().length - 1;
        }

        return new PortugolCodeDiagnostic(severity, message, ctx, startLine, startCol, endLine, endCol, code);
      }

      return new PortugolCodeDiagnostic(
        severity,
        message,
        ctx,
        Math.max(startLine - 1, 1),
        startCol,
        startLine,
        startCol + Math.max(ctx.getText().length, 1) - 1,
        code,
      );
    }

    if (Object.hasOwn(ctx, "getPayload") && typeof ctx.getPayload === "function") {
      const possibleSymbol = ctx.getPayload() as Token | ParseTree | ParserRuleContext | undefined;

      if (possibleSymbol && Object.hasOwn(possibleSymbol, "column") && Object.hasOwn(possibleSymbol, "line")) {
        const { line, column } = possibleSymbol as unknown as Token;

        return new PortugolCodeDiagnostic(
          severity,
          message,
          ctx,
          line,
          column,
          line,
          column + ctx.getText().length,
          code,
        );
      }
    }

    if (Object.hasOwn(ctx, "getText") && typeof ctx.getText === "function") {
      return new PortugolCodeDiagnostic(severity, message, ctx, 1, 1, 1, 2 + ctx.getText().length, code);
    }

    return new PortugolCodeDiagnostic(severity, message, ctx, 1, 0, 9999, 0, code);
  }
}

export class PortugolErrorListener implements ANTLRErrorListener {
  private errors: PortugolCodeDiagnostic[] = [];

  syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    offendingSymbol: S | null,
    _line: number,
    _charPositionInLine: number,
    _msg: string,
    e: RecognitionException | null,
  ) {
    this.errors.push(
      PortugolCodeDiagnostic.fromContext(e?.ctx || offendingSymbol || (null as any), "Código incompleto ou inválido"),
    );
  }

  getErrors() {
    return this.errors;
  }

  reset() {
    this.errors = [];
  }

  reportAmbiguity(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _exact: boolean,
    _ambigAlts: BitSet | undefined,
    _configs: ATNConfigSet,
  ) {}

  reportAttemptingFullContext(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _conflictingAlts: BitSet | undefined,
    _configs: ATNConfigSet,
  ) {}

  reportContextSensitivity(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _prediction: number,
    _configs: ATNConfigSet,
  ) {}
}
