import { PortugolErrorChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";

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
    const result = PortugolErrorChecker.checkCode(code);

    errors = result.errors;
    parseErrors = result.parseErrors;
  } catch (error) {
    console.log("check error", error);
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
  let checkTime = 0;
  let transpileTime = 0;

  try {
    const checkStart = performance.now();
    const checkResult = PortugolErrorChecker.checkCode(code);

    errors = checkResult.errors;
    parseErrors = checkResult.parseErrors;

    const checkEnd = performance.now();

    checkTime = checkEnd - checkStart;

    const transpileStart = performance.now();
    js = new PortugolJs().visit(checkResult.tree);
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
