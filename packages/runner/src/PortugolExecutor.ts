import { PortugolErrorListener, PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import { CharStreams, CommonTokenStream } from "antlr4ts";
import type { Subscription } from "rxjs";
import { Subject } from "rxjs";

import type { IPortugolRunner, PortugolEvent } from "./runners/IPortugolRunner.js";

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

      // @ts-ignore
      this._runner = new this.runner(tree);

      if (!this._runner) {
        throw new Error("Runner not found");
      }

      this.byteCode = this._runner.byteCode;

      this._runner.stdOut$.subscribe(data => {
        this.stdOut = data;
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
          if (event.type === "finish") {
            this.stdOut += `\nPrograma finalizado. Tempo de execução: ${event.time} ms\n`;
            this.stdOut$.next(this.stdOut);
          }

          this.events.next(event);
        },

        error: error => {
          console.error(error);

          this.stdOut += `⛔ ${error.message}\n`;
          this.stdOut$.next(this.stdOut);

          this.reset(false);
        },
      });
    } catch (err) {
      console.error(err);

      this.stdOut += `⛔ O seu código possui um erro de compilação!\n`;
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
