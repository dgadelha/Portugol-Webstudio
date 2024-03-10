import {
  ANTLRErrorListener,
  RecognitionException,
  Recognizer,
  ParserRuleContext,
  Token,
  ATNConfigSet,
  ATNSimulator,
  ParseTree,
  BitSet,
  DFA,
  Parser,
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

    if (!ctx.hasOwnProperty("start") && !ctx.hasOwnProperty("stop") && ctx.parent) {
      possibleContext = ctx.parent;
    }

    if (
      possibleContext.hasOwnProperty("start") &&
      possibleContext.hasOwnProperty("stop") &&
      typeof (possibleContext as unknown as { start: unknown }).start === "object" &&
      typeof (possibleContext as unknown as { stop: unknown }).stop === "object"
    ) {
      const { start, stop } = possibleContext as unknown as { start: Token; stop: Token };
      const { line: startLine, column: startCol } = start;
      let { line: endLine, column: endCol } = stop;

      if (startLine === endLine && startCol === endCol) {
        endCol += ctx.getText().length - 1;
      }

      return new PortugolCodeError(message, ctx, startLine, startCol, endLine, endCol);
    }

    const possibleSymbol = ctx.getPayload() as Token | ParseTree | ParserRuleContext | undefined;

    if (possibleSymbol && possibleSymbol.hasOwnProperty("column") && possibleSymbol.hasOwnProperty("line")) {
      const { line, column } = possibleSymbol as unknown as Token;

      return new PortugolCodeError(message, ctx, line, column, line, column + ctx.getText().length);
    }

    return new PortugolCodeError(message, ctx, 1, 1, 1, 2 + ctx.getText().length);
  }
}

export class PortugolErrorListener implements ANTLRErrorListener {
  private errors: PortugolCodeError[] = [];

  syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    offendingSymbol: S | null,
    line: number,
    charPositionInLine: number,
    msg: string,
    e: RecognitionException | null,
  ): void {
    const endColumn =
      offendingSymbol && offendingSymbol.text ? charPositionInLine + offendingSymbol.text.length : charPositionInLine;

    this.errors.push(
      new PortugolCodeError(msg, e?.ctx || offendingSymbol || (null as any), line, charPositionInLine, line, endColumn),
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
