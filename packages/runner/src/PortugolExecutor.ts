import { PortugolErrorListener, PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import { PortugolErrorChecker } from "@portugol-webstudio/parser";
import { CharStreams, CommonTokenStream } from "antlr4ts";
import { Subscription, Subject } from "rxjs";

import { IPortugolRunner, PortugolEvent } from "./runners/IPortugolRunner.js";

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
    try {
      this.reset();

      const inputStream = CharStreams.fromString(code);
      const lexer = new PortugolLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new PortugolParser(tokenStream);

      this.errorListener.reset();

      parser.removeErrorListeners();
      parser.addErrorListener(this.errorListener);

      const tree = parser.arquivo();
      const errors = PortugolErrorChecker.checkTree(tree);

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
          "\n⚠️ Durante essa fase experimental, o código ainda será executado mesmo com erros, porém se não corrigi-los, a execução abaixo pode exibir mensagens de erro em inglês ou sem explicação.\n";
        this.stdOut += `   Caso acredite que o erro não faça sentido, por favor, abra uma issue em https://github.com/dgadelha/Portugol-Webstudio/issues/new e anexe o código que você está tentando executar.\n\n`;

        argueAboutAlgolIfNeeded();

        this.stdOut += "- O seu programa irá iniciar abaixo -\n";
        this.stdOut$.next(this.stdOut);
      }

      // @ts-ignore
      this._runner = new this.runner(tree);

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
            case "finish":
              this.stdOut += `\nPrograma finalizado. Tempo de execução: ${event.time} ms\n`;
              this.stdOut$.next(this.stdOut);
              break;

            case "clear":
              this.stdOut = "";
              this.stdOut$.next(this.stdOut);
              break;

            case "error":
              this.stdOut += `\n⛔ ${event.error.message}\n`;
              this.stdOut$.next(this.stdOut);
              break;

            default:
              break;
          }

          this.events.next(event);
        },

        error: error => {
          console.error(error);
        },
      });
    } catch (err) {
      console.error(err);

      this.stdOut += `\n⛔ O seu código possui um erro de compilação!\n`;
      this.stdOut$.next(this.stdOut);

      this.reset(false);
      this.events.next({ type: "parseError", errors: this.errorListener.getErrors() });
      this.events.error(err);
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
}
