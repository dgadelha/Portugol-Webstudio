import { PortugolErrorListener, PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import { PortugolErrorChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";
import { CharStream, CommonTokenStream } from "antlr4ng";

function mapError(error) {
  if (typeof error !== "object" || error === null) {
    return {
      message: String(error),
    };
  }

  return {
    message: error.message,
    startLine: error.startLine,
    startCol: error.startCol,
    endLine: error.endLine,
    endCol: error.endCol,
  };
}

/**
 * @param {string} code
 */
function checkCode(code) {
  let errors = [];
  let parseErrors = [];

  try {
    const inputStream = CharStream.fromString(code);
    const lexer = new PortugolLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new PortugolParser(tokenStream);
    const errorListener = new PortugolErrorListener();

    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);

    parseErrors = errorListener.getErrors();

    const tree = parser.arquivo();
    errors = PortugolErrorChecker.checkTree(tree);
    parseErrors = errorListener.getErrors();
  } catch (error) {
    parseErrors.push(error);
  }

  return {
    errors: errors.map(error => mapError(error)),
    parseErrors: parseErrors.map(error => mapError(error)),
  };
}

/**
 * @param {string} code
 */
function transpileCode(code) {
  /**
   * @type {string | null}
   */
  let js = "";
  let errors = [];
  let parseErrors = [];
  let parseTime = 0;
  let checkTime = 0;
  let transpileTime = 0;

  try {
    const parseStart = performance.now();
    const inputStream = CharStream.fromString(code);
    const lexer = new PortugolLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new PortugolParser(tokenStream);
    const errorListener = new PortugolErrorListener();

    errorListener.reset();

    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);

    const tree = parser.arquivo();
    const parseEnd = performance.now();

    parseTime = parseEnd - parseStart;
    parseErrors = errorListener.getErrors();

    const checkStart = performance.now();
    errors = PortugolErrorChecker.checkTree(tree);
    const checkEnd = performance.now();

    checkTime = checkEnd - checkStart;

    parseErrors = errorListener.getErrors();
    const transpileStart = performance.now();
    js = new PortugolJs().visit(tree);
    const transpileEnd = performance.now();

    transpileTime = transpileEnd - transpileStart;
  } catch (error) {
    parseErrors.push(error);
  }

  return {
    js,
    errors: errors.map(error => mapError(error)),
    parseErrors: parseErrors.map(error => mapError(error)),
    times: {
      parse: parseTime,
      check: checkTime,
      transpile: transpileTime,
    },
  };
}

self.addEventListener("message", function onmessage(e) {
  const { action, id, code } = e.data;
  let result;

  switch (action) {
    case "check": {
      result = checkCode(code);
      break;
    }

    case "transpile": {
      result = transpileCode(code);
      break;
    }

    default: {
      throw new Error(`Unknown action: ${action}`);
    }
  }

  self.postMessage({
    id,
    ...result,
  });
});
