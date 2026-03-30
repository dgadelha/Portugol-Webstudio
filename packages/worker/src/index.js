import { PortugolCodeChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";

function mapError(error) {
  if (typeof error !== "object" || error === null) {
    return {
      severity: 0,
      message: String(error),
    };
  }

  return {
    severity: error.severity,
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
  let diagnostics = [];
  let parseErrors = [];

  try {
    const result = PortugolCodeChecker.checkCode(code);

    diagnostics = result.diagnostics;
    parseErrors = result.parseErrors;
  } catch (error) {
    console.log("check error", error);
    parseErrors.push(error);
  }

  return {
    diagnostics: diagnostics.map(error => mapError(error)),
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
  let diagnostics = [];
  let parseErrors = [];
  let checkTime = 0;
  let transpileTime = 0;

  try {
    const checkStart = performance.now();
    const checkResult = PortugolCodeChecker.checkCode(code);

    diagnostics = checkResult.diagnostics;
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
    diagnostics: diagnostics.map(error => mapError(error)),
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
