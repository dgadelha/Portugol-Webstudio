import { ANTLRErrorListener, RecognitionException, Recognizer, Token } from "antlr4ts";

export class PortugolSyntaxError extends Error {
  public readonly startLine: number;
  public readonly endLine: number;
  public readonly startCol: number;
  public readonly endCol: number;
  public readonly message: string;

  constructor(startLine: number, endLine: number, startCol: number, endCol: number, message: string) {
    super(message);
    this.startLine = startLine;
    this.endLine = endLine;
    this.startCol = startCol;
    this.endCol = endCol;
    this.message = message;
  }
}

export class PortugolErrorListener implements ANTLRErrorListener<Token> {
  private errors: PortugolSyntaxError[] = [];

  syntaxError(
    _recognizer: Recognizer<number, any>,
    offendingSymbol: Token | undefined,
    line: number,
    charPositionInLine: number,
    msg: string,
    _e: RecognitionException | undefined,
  ) {
    const endColumn =
      offendingSymbol && offendingSymbol.text
        ? charPositionInLine + offendingSymbol.text.length
        : charPositionInLine + 1;

    this.errors.push(new PortugolSyntaxError(line, line, charPositionInLine, endColumn, msg));
  }

  getErrors() {
    return this.errors;
  }

  reset() {
    this.errors = [];
  }
}
