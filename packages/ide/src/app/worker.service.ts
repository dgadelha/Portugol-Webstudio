import { Injectable } from "@angular/core";
import { PortugolCodeError } from "@portugol-webstudio/antlr";

@Injectable({ providedIn: "root" })
export class WorkerService {
  worker?: Worker;
  busy = false;

  init() {
    this.worker = new Worker("assets/portugol-worker/worker.js");
  }

  async checkCode(code: string): Promise<{
    errors: PortugolCodeError[];
    parseErrors: PortugolCodeError[];
  }> {
    if (!this.worker) {
      this.init();
    }

    return new Promise(resolve => {
      const id = Math.random().toString(36).slice(2, 9);
      const now = Date.now();

      const listener = (e: MessageEvent) => {
        if (e.data.id === id) {
          console.log("Checker Result", e.data, `${Date.now() - now}ms`);
          this.worker?.removeEventListener("message", listener);
          resolve(e.data);
        }
      };

      this.worker?.addEventListener("message", listener);
      this.worker?.postMessage({ code, id, action: "check" });
    });
  }

  async transpileCode(code: string): Promise<{
    js: string;
    errors: PortugolCodeError[];
    parseErrors: PortugolCodeError[];
    times: { parse: number; check: number; transpile: number };
  }> {
    if (!this.worker) {
      this.init();
    }

    this.busy = true;

    return new Promise(resolve => {
      const id = Math.random().toString(36).slice(2, 9);
      const now = Date.now();

      const listener = (e: MessageEvent) => {
        if (e.data.id === id) {
          console.log("Transpiler Result", e.data, `${Date.now() - now}ms`);
          this.worker?.removeEventListener("message", listener);
          this.busy = false;
          resolve(e.data);
        }
      };

      this.worker?.addEventListener("message", listener);
      this.worker?.postMessage({ code, id, action: "transpile" });
    });
  }

  abortTranspilation() {
    if (this.worker && this.busy) {
      this.worker.terminate();
      this.worker = undefined;
    }
  }
}
