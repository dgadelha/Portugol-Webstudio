import { IPortugolCodeDiagnostic, PortugolDiagnosticSeverity, PortugolErrorListener } from "@portugol-webstudio/antlr";
import { PortugolCodeChecker } from "@portugol-webstudio/parser";
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
    let diagnostics: IPortugolCodeDiagnostic[] = [];
    let parseErrors: IPortugolCodeDiagnostic[] = [];
    let js = "";
    let checkStart = 0;
    let checkEnd = 0;
    let transpileStart = 0;
    let transpileEnd = 0;

    try {
      checkStart = performance.now();
      const checkResult = PortugolCodeChecker.checkCode(code);

      diagnostics = checkResult.diagnostics;
      parseErrors = checkResult.parseErrors;

      checkEnd = performance.now();

      transpileStart = performance.now();
      js = new PortugolJs().visit(checkResult.tree)!;
      transpileEnd = performance.now();
    } catch {}

    this.runTranspiled({
      js,
      diagnostics,
      parseErrors,
      times: {
        check: checkEnd - checkStart,
        transpile: transpileEnd - transpileStart,
      },
    });
  }

  #printTimes(_times: { check: number; transpile: number; execution?: number }) {}

  runTranspiled({
    js,
    diagnostics,
    parseErrors,
    times,
  }: {
    js: string;
    diagnostics: IPortugolCodeDiagnostic[];
    parseErrors: IPortugolCodeDiagnostic[];
    times: { check: number; transpile: number };
  }) {
    try {
      this.reset();

      /**
       * Como o Portugol Studio: código com erro de compilação não executa. Os erros vão para
       * a saída porque nem todo cliente do runner tem um editor que os mostre. Erro de
       * sintaxe vem primeiro: se o arquivo nem analisou, o resto é consequência.
       */
      const errors = [
        ...parseErrors,
        ...diagnostics.filter(diagnostic => diagnostic.severity === PortugolDiagnosticSeverity.Error),
      ];

      if (errors.length > 0) {
        const plural = errors.length > 1 ? "s" : "";

        this.stdOut += `⛔ O seu código possui ${errors.length} erro${plural} de compilação e não foi executado:\n\n`;

        this.stdOut += errors
          .map(error => `ERRO: ${error.message} (linha ${error.startLine}, coluna ${error.startCol})\n`)
          .join("");

        this.stdOut$.next(this.stdOut);
        this.#printTimes(times);
        this.reset(false);
        this.events.next({ type: "parseError", errors: parseErrors });

        return;
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
              if (event.stopped) {
                this.stdOut += `\nO programa foi interrompido! Tempo de execução: ${event.time} milissegundos\n`;
              } else {
                this.stdOut += `\nPrograma finalizado. Tempo de execução: ${event.time} milissegundos\n`;
              }

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
    this.reset(false);
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

    this._runner?.destroy(true);
  }

  postMessage(message: PortugolMessage) {
    this._runner?.postMessage(message);
  }

  replyMessage(message: PortugolMessage, result: unknown, transferable?: Transferable[]) {
    this._runner?.replyMessage(message, result, transferable);
  }
}
