import type { IPortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import { WORKER_FILE_NAME } from "@portugol-webstudio/worker/lib/worker-manifest";

export interface CheckResult {
  diagnostics: IPortugolCodeDiagnostic[];
  parseErrors: IPortugolCodeDiagnostic[];
}

export interface TranspileResult extends CheckResult {
  js: string;
  times: { check: number; transpile: number };
}

/**
 * Worker que checa e transpila o código fora da thread principal. É um só para todas as abas.
 */
class PortugolWorkerClient {
  private worker?: Worker;
  private busy = false;

  private request<T>(action: "check" | "transpile", code: string, label: string) {
    this.worker ??= new Worker(`/assets/portugol-worker/${WORKER_FILE_NAME}`);

    const worker = this.worker;

    return new Promise<T>(resolve => {
      const id = Math.random().toString(36).slice(2, 9);
      const startedAt = Date.now();

      const listener = (event: MessageEvent<T & { id: string }>) => {
        if (event.data.id === id) {
          console.log(label, event.data, `${Date.now() - startedAt}ms`);
          worker.removeEventListener("message", listener);
          resolve(event.data);
        }
      };

      worker.addEventListener("message", listener);
      worker.postMessage({ code, id, action });
    });
  }

  checkCode(code: string) {
    return this.request<CheckResult>("check", code, "Checker Result");
  }

  async transpileCode(code: string) {
    this.busy = true;

    try {
      return await this.request<TranspileResult>("transpile", code, "Transpiler Result");
    } finally {
      this.busy = false;
    }
  }

  /**
   * Interrompe uma transpilação em andamento. O worker é descartado e recriado no próximo uso.
   */
  abortTranspilation() {
    if (this.worker && this.busy) {
      this.worker.terminate();
      this.worker = undefined;
      this.busy = false;
    }
  }
}

export const portugolWorker = new PortugolWorkerClient();
