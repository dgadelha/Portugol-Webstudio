import { ANTLRErrorListener, RecognitionException, Recognizer, RuleContext, Token } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree.js";

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

    if (!ctx.hasOwnProperty("_start") && !ctx.hasOwnProperty("_stop") && ctx.parent) {
      possibleContext = ctx.parent;
    }

    if (
      possibleContext.hasOwnProperty("_start") &&
      possibleContext.hasOwnProperty("_stop") &&
      typeof (possibleContext as unknown as { _start: any })._start === "object" &&
      typeof (possibleContext as unknown as { _stop: any })._stop === "object"
    ) {
      const { _start, _stop } = possibleContext as unknown as { _start: any; _stop: any };
      const { line: startLine, _charPositionInLine: startCol } = _start;
      let { line: endLine, _charPositionInLine: endCol } = _stop;

      if (startLine === endLine && startCol === endCol) {
        endCol += ctx.text.length - 1;
      }

      return new PortugolCodeError(message, ctx, startLine, startCol, endLine, endCol);
    }

    const possibleSymbol: Token | RuleContext | undefined = (ctx as any).symbol || (ctx as any).payload;

    if (
      possibleSymbol &&
      possibleSymbol.hasOwnProperty("_charPositionInLine") &&
      possibleSymbol.hasOwnProperty("_line")
    ) {
      const { _charPositionInLine, _line } = (ctx as any).symbol as unknown as { _charPositionInLine: any; _line: any };

      return new PortugolCodeError(
        message,
        ctx,
        _line,
        _charPositionInLine,
        _line,
        _charPositionInLine + ctx.text.length,
      );
    }

    return new PortugolCodeError(message, ctx, 1, 1, 1, 2 + ctx.text.length);
  }
}

export class PortugolErrorListener implements ANTLRErrorListener<Token> {
  private errors: PortugolCodeError[] = [];

  syntaxError(
    _recognizer: Recognizer<number, any>,
    offendingSymbol: Token | undefined,
    line: number,
    charPositionInLine: number,
    msg: string,
    exception: RecognitionException | undefined,
  ) {
    const endColumn =
      offendingSymbol && offendingSymbol.text ? charPositionInLine + offendingSymbol.text.length : charPositionInLine;

    this.errors.push(
      new PortugolCodeError(
        msg,
        exception?.context || offendingSymbol || (null as any),
        line,
        charPositionInLine,
        line,
        endColumn,
      ),
    );
  }

  getErrors() {
    return this.errors;
  }

  reset() {
    this.errors = [];
  }
}
