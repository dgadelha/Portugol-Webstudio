import { PortugolCodeChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";
import { PortugolWorkerThreadsRunner } from "../../src";

class NoMoreInputsError extends Error {
  constructor() {
    super("No more inputs available");
    this.name = "NoMoreInputsError";
  }
}

class InputsRemainingError extends Error {
  constructor(remainingInputs: string[]) {
    super(`There are still ${remainingInputs.length} input(s) remaining`);
    this.name = "InputsRemainingError";
  }
}

export function runPortugolCode(code: string, inputs: string[] = []) {
  const hasInputs = inputs.length > 0;

  return new Promise<string>((resolve, reject) => {
    const checkerResult = PortugolCodeChecker.checkCode(code);
    const byteCode = new PortugolJs().visit(checkerResult.tree);
    const runner = new PortugolWorkerThreadsRunner(byteCode!);
    let stdOut = "";

    const _stdOut$ = runner.stdOut$.subscribe(output => {
      stdOut += output;
    });

    const _events$ = runner.run().subscribe(event => {
      switch (event.type) {
        case "stdIn": {
          if (inputs.length === 0) {
            reject(new NoMoreInputsError());
            break;
          }

          runner.stdIn.next(inputs.shift()!);
          break;
        }

        case "clear": {
          stdOut = "";
          break;
        }

        case "parseError": {
          _stdOut$.unsubscribe();
          _events$.unsubscribe();

          reject(new Error("Parse errors", { cause: event.errors }));

          break;
        }

        case "finish": {
          _stdOut$.unsubscribe();
          _events$.unsubscribe();

          if (hasInputs && inputs.length > 0) {
            reject(new InputsRemainingError(inputs));
            return;
          }

          resolve(stdOut);
          break;
        }
      }
    });
  });
}
