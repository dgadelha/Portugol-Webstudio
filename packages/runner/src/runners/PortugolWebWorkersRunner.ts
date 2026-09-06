import { PortugolJsRuntime } from "@portugol-webstudio/runtime";
import { Subject, Subscription } from "rxjs";

import { IPortugolRunner, PortugolEvent, PortugolMessage } from "./IPortugolRunner.js";

export class PortugolWebWorkersRunner extends IPortugolRunner {
  private worker: Worker;

  stdIn = new Subject<string>();
  private _stdIn$?: Subscription;

  stdOut$ = new Subject<string>();

  waitingForInput = false;
  waitingForInput$ = new Subject<boolean>();

  running = false;
  running$ = new Subject<boolean>();

  startedAt?: Date;

  private _run = new Subject<PortugolEvent>();

  constructor(public byteCode: string) {
    super(byteCode);

    const runCode = /* javascript */ `
      const exec = ${this.byteCode};

      self.addEventListener("message", async (message) => {
        try {
          if (message.data.type === "start") {
            self.postMessage({ type: "started" });

            await exec({
              functions: {
                __debug: async (...args) => {
                  for (const arg of args) {
                    console.debug("➡️ DEBUG", arg);
                  }
                },

                limpa: async () => {
                  self.postMessage({ type: "clear" });
                },

                leia: async (...args) => {
                  for (const arg of args) {
                    const controller = new AbortController();
                    const signal = controller.signal;

                    const result = await new Promise((resolve) => {
                      self.addEventListener("message", (message) => {
                        if (message.data.type === "stdIn") {
                          controller.abort();
                          resolve(message.data.content);
                        }
                      }, { signal });

                      self.postMessage({ type: "stdIn" });
                    });

                    self.runtime.assign([arg, self.runtime.readValue(arg.type, result)]);
                  }
                },

                escreva: (...args) => {
                  let str = "";

                  for (const arg of args) {
                    if (typeof arg === "object") {
                      if (typeof arg.value !== "undefined") {
                        str += arg.stringValue();
                      }
                    } else {
                      throw new Error("Argumento inválido");
                    }
                  }

                  self.postMessage({ type: "stdOut", content: str });
                },
              },
            });
          }
        } catch (error) {
          self.postMessage({ type: "error", error: {
            message: error.message,
            stack: error.stack,
          }});
        } finally {
          self.postMessage({ type: "finish" });
        }
      }, { once: true });
    `;

    this.worker = new Worker(
      URL.createObjectURL(
        new Blob([PortugolJsRuntime, runCode], {
          type: "text/javascript",
        }),
      ),
    );

    this.worker.addEventListener("message", (message: MessageEvent) => {
      switch (message.data.type) {
        case "stdOut": {
          this.stdOut$.next(message.data.content);
          break;
        }

        case "stdIn": {
          this.waitingForInput = true;
          this.waitingForInput$.next(this.waitingForInput);

          this._run.next({ type: "stdIn" });
          break;
        }

        case "error": {
          const error = new Error(message.data.error.message);

          error.stack = message.data.error.stack;

          this._run.next({ type: "error", error });
          this.destroy();
          break;
        }

        case "clear": {
          this._run.next({ type: "clear" });
          break;
        }

        case "finish": {
          this.destroy();
          break;
        }

        case "started": {
          break;
        }

        case "message": {
          this._run.next({
            type: "message",
            message: message.data.message,
          });

          break;
        }

        default: {
          throw new Error(`Unknown message type: ${message.data.type}`);
        }
      }
    });

    this.worker.addEventListener("error", err => {
      const error = err.error ?? new Error(err.message);

      this._run.next({ type: "error", error });
      this.destroy();
    });

    this._stdIn$ = this.stdIn.subscribe(content => {
      if (this.waitingForInput) {
        this.waitingForInput = false;
        this.waitingForInput$.next(this.waitingForInput);

        this.worker.postMessage({ type: "stdIn", content });
      }
    });
  }

  run() {
    this.startedAt = new Date();

    this.worker.postMessage({ type: "start" });

    this.running = true;
    this.running$.next(this.running);

    return this._run;
  }

  destroy(stopped = false) {
    this.worker.terminate();

    this._run.next({
      type: "finish",
      time: Date.now() - (this.startedAt?.getTime() ?? 0),
      stopped,
    });

    this._run.complete();

    this.running = false;

    this.running$.next(false);
    this.running$.complete();

    this._stdIn$?.unsubscribe();
    this.stdIn.complete();
  }

  postMessage(message: PortugolMessage) {
    if (!Object.hasOwn(message, "id")) {
      message.id = Math.random().toString(36).slice(2, 11);
    }

    this.worker.postMessage({
      type: "message",
      message,
    });
  }

  replyMessage(message: PortugolMessage, result: unknown, transferable?: Transferable[]) {
    if (!Object.hasOwn(message, "id")) {
      throw new Error("Não é possível responder uma mensagem sem identificador!");
    }

    const replyMessage = {
      type: "message-reply",
      id: message.id,
      result,
    };

    if (transferable) {
      this.worker.postMessage(replyMessage, transferable);
    } else {
      this.worker.postMessage(replyMessage);
    }
  }
}
