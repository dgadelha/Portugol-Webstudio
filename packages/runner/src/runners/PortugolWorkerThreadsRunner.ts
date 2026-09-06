import { Worker } from "node:worker_threads";

import { PortugolJsRuntime } from "@portugol-webstudio/runtime";
import { Subject, Subscription } from "rxjs";

import { IPortugolRunner, PortugolEvent, PortugolMessage } from "./IPortugolRunner.js";

export class PortugolWorkerThreadsRunner extends IPortugolRunner {
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
      const { parentPort } = require("node:worker_threads");
      var self = self || globalThis;

      ${PortugolJsRuntime}

      const exec = ${this.byteCode};

      parentPort.once("message", async (data) => {
        try {
          if (data.type === "start") {
            parentPort.postMessage({ type: "started" });

            await exec({
              functions: {
                __debug: async (...args) => {
                  for (const arg of args) {
                    console.debug("➡️ DEBUG", arg);
                  }
                },

                limpa: async () => {
                  parentPort.postMessage({ type: "clear" });
                },

                leia: async (...args) => {
                  for (const arg of args) {
                    const result = await new Promise((resolve) => {
                      const handler = (message) => {
                        if (message.type === "stdIn") {
                          parentPort.off("message", handler);
                          resolve(message.content);
                        }
                      };

                      parentPort.on("message", handler);
                      parentPort.postMessage({ type: "stdIn" });
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

                  parentPort.postMessage({ type: "stdOut", content: str });
                },
              },
            });
          }
        } catch (error) {
          parentPort.postMessage({ type: "error", error: {
            message: error.message,
            stack: error.stack,
          }});
        } finally {
          parentPort.postMessage({ type: "finish" });
        }
      });
    `;

    this.worker = new Worker(runCode, { eval: true });

    this.worker.on(
      "message",
      (data: {
        type: string;
        content?: string;
        error?: { message: string; stack?: string };
        message?: PortugolMessage;
      }) => {
        switch (data.type) {
          case "stdOut": {
            this.stdOut$.next(data.content!);
            break;
          }

          case "stdIn": {
            this.waitingForInput = true;
            this.waitingForInput$.next(this.waitingForInput);

            this._run.next({ type: "stdIn" });
            break;
          }

          case "error": {
            const error = new Error(data.error!.message);

            error.stack = data.error!.stack;

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
              message: data.message!,
            });

            break;
          }

          default: {
            throw new Error(`Unknown message type: ${data.type}`);
          }
        }
      },
    );

    this.worker.on("error", (err: Error) => {
      this._run.next({ type: "error", error: err });
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
    void this.worker.terminate();

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

  replyMessage(message: PortugolMessage, result: unknown) {
    if (!Object.hasOwn(message, "id")) {
      throw new Error("Não é possível responder uma mensagem sem identificador!");
    }

    this.worker.postMessage({
      type: "message-reply",
      id: message.id,
      result,
    });
  }
}
