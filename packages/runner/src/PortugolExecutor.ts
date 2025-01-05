import { PortugolCodeError, PortugolErrorListener } from "@portugol-webstudio/antlr";
import { PortugolErrorChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";
import { Subject, Subscription } from "rxjs";

import { IPortugolRunner, PortugolEvent, PortugolMessage } from "./runners/IPortugolRunner.js";

export class PortugolExecutor {
  private _runner?: IPortugolRunner;

  constructor(private runner: typeof IPortugolRunner) {
    this.stdIn.subscribe(data => {
      if (data === "\b") {
        if (this.stdInBuffer.length > 0) {
          this.stdInBuffer = this.stdInBuffer.slice(0, -1);
          this.stdOut = this.stdOut.slice(0, -1);
        }
      } else if (data === "\r") {
        this._runner?.stdIn.next(this.stdInBuffer);
        this.stdInBuffer = "";
        this.stdOut += "\n";
      } else {
        this.stdInBuffer += data;
        this.stdOut += data;
      }

      this.stdOut$.next(this.stdOut);
    });
  }

  byteCode = "";

  stdInBuffer = "";
  stdIn = new Subject<string>();

  stdOut = "";
  stdOut$ = new Subject<string>();
  private _stdOut$?: Subscription;

  waitingForInput = false;
  waitingForInput$ = new Subject<boolean>();
  private _waitingForInput$?: Subscription;

  running = false;
  running$ = new Subject<boolean>();
  private _running$?: Subscription;

  events = new Subject<PortugolEvent>();
  errorListener = new PortugolErrorListener();

  run(code: string) {
    let errors: PortugolCodeError[] = [];
    let parseErrors: PortugolCodeError[] = [];
    let js = "";
    let checkStart = 0;
    let checkEnd = 0;
    let transpileStart = 0;
    let transpileEnd = 0;

    try {
      checkStart = performance.now();
      const checkResult = PortugolErrorChecker.checkCode(code);

      errors = checkResult.errors;
      parseErrors = checkResult.parseErrors;

      checkEnd = performance.now();

      transpileStart = performance.now();
      js = new PortugolJs().visit(checkResult.tree)!;
      transpileEnd = performance.now();
    } catch {}

    this.runTranspiled({
      code,
      js,
      errors,
      parseErrors,
      times: {
        check: checkEnd - checkStart,
        transpile: transpileEnd - transpileStart,
      },
    });
  }

  #printTimes(_times: { check: number; transpile: number; execution?: number }) {}

  runTranspiled({
    code,
    js,
    errors,
    parseErrors,
    times,
  }: {
    code: string;
    js: string;
    errors: PortugolCodeError[];
    parseErrors: PortugolCodeError[];
    times: { check: number; transpile: number };
  }) {
    try {
      this.reset();

      if (parseErrors.length > 0) {
        throw new Error("Parse errors");
      }

      if (errors.length > 0) {
        const argueAboutAlgolIfNeeded = () => {
          if (
            ["fimalgoritmo", "fimenquanto", "fimpara", "fimse", "fimfuncao"].some(keyword => code.includes(keyword))
          ) {
            this.stdOut += `\n`;
            this.stdOut += `╔═════════════════════════════════════╗\n`;
            this.stdOut += `║               ATENÇÃO               ║\n`;
            this.stdOut += `║                                     ║\n`;
            this.stdOut += `║ Foi detectado que o seu código está ║\n`;
            this.stdOut += `║ usando o Portugol no formato Algol. ║\n`;
            this.stdOut += `║ O Portugol Webstudio dá suporte ao  ║\n`;
            this.stdOut += `║ Portugol no formato definido pela   ║\n`;
            this.stdOut += `║ UNIVALI. Por favor, leia mais sobre ║\n`;
            this.stdOut += `║ na seção Ajuda.                     ║\n`;
            this.stdOut += `╚═════════════════════════════════════╝\n\n`;
          }
        };

        argueAboutAlgolIfNeeded();

        this.stdOut += `⛔ O seu código possui ${errors.length} erro${errors.length > 1 ? "s" : ""} de compilação:\n`;
        this.stdOut += errors
          .map(error => `   - ${error.message} (linha ${error.startLine}, posição ${error.startCol})\n`)
          .join("");

        this.stdOut +=
          "\n⚠️ Estamos aprimorando a detecção de erros. Seu código será executado mesmo com erros, mas se não forem corrigidos, a execução pode exibir mensagens de erro em inglês ou sem explicação.\n";

        argueAboutAlgolIfNeeded();

        this.stdOut += "- O seu programa irá iniciar abaixo -\n";
        this.stdOut$.next(this.stdOut);
      }

      // @ts-expect-error
      this._runner = new this.runner(js);

      if (!this._runner) {
        throw new Error("Runner not found");
      }

      this.byteCode = this._runner.byteCode;

      this._runner.stdOut$.subscribe(data => {
        this.stdOut += data;
        this.stdOut$.next(data);
      });

      this._runner.waitingForInput$.subscribe(data => {
        this.waitingForInput = data;
        this.waitingForInput$.next(data);
      });

      this._runner.running$.subscribe(data => {
        this.running = data;
        this.running$.next(data);
      });

      this._runner.run().subscribe({
        next: event => {
          switch (event.type) {
            case "finish": {
              this.stdOut += `\nPrograma finalizado. Tempo de execução: ${event.time} milissegundos\n`;
              this.#printTimes({ ...times, execution: event.time });
              this.stdOut$.next(this.stdOut);
              break;
            }

            case "clear": {
              this.stdOut = "";
              this.stdOut$.next(this.stdOut);
              break;
            }

            case "error": {
              this.stdOut += `\n⛔ ${event.error.message}\n`;
              this.stdOut$.next(this.stdOut);
              break;
            }

            default: {
              break;
            }
          }

          this.events.next(event);
        },

        error(error) {
          console.error(error);
        },
      });
    } catch (error) {
      console.error(error);

      this.stdOut += `\n⛔ O seu código possui um erro de compilação!\n`;
      this.stdOut$.next(this.stdOut);
      this.#printTimes(times);

      this.reset(false);
      this.events.next({ type: "parseError", errors: parseErrors });
    }
  }

  stop() {
    this.reset();
  }

  private reset(clearStdOut = true) {
    if (clearStdOut) {
      this.stdOut = "";
    }

    this._stdOut$?.unsubscribe();

    this.waitingForInput = false;
    this._waitingForInput$?.unsubscribe();

    this.running = false;
    this._running$?.unsubscribe();

    this._runner?.destroy();
  }

  postMessage(message: PortugolMessage): void {
    this._runner?.postMessage(message);
  }
}
