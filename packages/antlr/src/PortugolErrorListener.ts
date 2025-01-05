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

export class PortugolCodeError extends Error {
  constructor(
    public readonly message: string,
    public readonly context: ParseTree,
    public readonly startLine: number,
    public readonly startCol: number,
    public readonly endLine: number,
    public readonly endCol: number,
  ) {
    super(message);
  }

  static fromContext(ctx: ParseTree, message: string) {
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
      return new PortugolCodeError(message, ctx, 1, 0, 9999, 0);
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

        return new PortugolCodeError(message, ctx, startLine, startCol, endLine, endCol);
      }

      return new PortugolCodeError(
        message,
        ctx,
        Math.max(startLine - 1, 1),
        startCol,
        startLine,
        startCol + ctx.getText().length,
      );
    }

    if (Object.hasOwn(ctx, "getPayload") && typeof ctx.getPayload === "function") {
      const possibleSymbol = ctx.getPayload() as Token | ParseTree | ParserRuleContext | undefined;

      if (possibleSymbol && Object.hasOwn(possibleSymbol, "column") && Object.hasOwn(possibleSymbol, "line")) {
        const { line, column } = possibleSymbol as unknown as Token;

        return new PortugolCodeError(message, ctx, line, column, line, column + ctx.getText().length);
      }
    }

    if (Object.hasOwn(ctx, "getText") && typeof ctx.getText === "function") {
      return new PortugolCodeError(message, ctx, 1, 1, 1, 2 + ctx.getText().length);
    }

    return new PortugolCodeError(message, ctx, 1, 0, 9999, 0);
  }
}

export class PortugolErrorListener implements ANTLRErrorListener {
  private errors: PortugolCodeError[] = [];

  syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    offendingSymbol: S | null,
    _line: number,
    _charPositionInLine: number,
    _msg: string,
    e: RecognitionException | null,
  ): void {
    this.errors.push(
      PortugolCodeError.fromContext(e?.ctx || offendingSymbol || (null as any), "Código incompleto ou inválido"),
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
