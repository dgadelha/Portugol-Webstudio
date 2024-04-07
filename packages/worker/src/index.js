import { PortugolErrorListener, PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import { PortugolErrorChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";
import { CharStream, CommonTokenStream } from "antlr4ng";

function mapError(error) {
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
  const inputStream = CharStream.fromString(code);
  const lexer = new PortugolLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new PortugolParser(tokenStream);
  const errorListener = new PortugolErrorListener();

  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);

  const tree = parser.arquivo();
  const errors = PortugolErrorChecker.checkTree(tree);
  const parseErrors = errorListener.getErrors();

  return {
    errors: errors.map(error => mapError(error)),
    parseErrors: parseErrors.map(error => mapError(error)),
  };
}

/**
 * @param {string} code
 */
function transpileCode(code) {
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
  const checkStart = performance.now();
  const errors = PortugolErrorChecker.checkTree(tree);
  const checkEnd = performance.now();
  const parseErrors = errorListener.getErrors();
  const transpileStart = performance.now();
  const js = new PortugolJs().visit(tree);
  const transpileEnd = performance.now();

  return {
    js,
    errors: errors.map(error => mapError(error)),
    parseErrors: parseErrors.map(error => mapError(error)),
    times: {
      parse: parseEnd - parseStart,
      check: checkEnd - checkStart,
      transpile: transpileEnd - transpileStart,
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
