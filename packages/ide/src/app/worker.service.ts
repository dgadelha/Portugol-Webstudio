import { Service } from "@angular/core";
import { IPortugolCodeDiagnostic, PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { WORKER_FILE_NAME } from "@portugol-webstudio/worker/lib/worker-manifest";

/**
 * O nome do erro que os pedidos pendentes recebem quando o worker cai.
 */
export const WORKER_CRASH_ERROR = "WorkerCrashError";

type CheckResult = {
  diagnostics: IPortugolCodeDiagnostic[];
  parseErrors: IPortugolCodeDiagnostic[];
};

type TranspileResult = CheckResult & {
  js: string;
  times: { check: number; transpile: number };
};

type Request = {
  message: { action: "check" | "transpile"; code: string; debugSteps?: boolean };
  started: number;
  resolve: (data: never) => void;
  reject: (error: Error) => void;
};

/**
 * O worker que analisa e transpila o código, um só para todas as abas. Cada pedido espera a
 * própria resposta; interromper um pedido não perde os das outras abas.
 */
@Service()
export class WorkerService {
  private worker?: Worker;
  private readonly requests = new Map<string, Request>();

  checkCode(code: string) {
    return this.request<CheckResult>({ action: "check", code });
  }

  /**
   * Com `signal`, a transpilação pode ser interrompida (o Parar, ou a aba fechando): a
   * promessa é rejeitada com um `AbortError`.
   */
  transpileCode(code: string, { debugSteps = false, signal }: { debugSteps?: boolean; signal?: AbortSignal } = {}) {
    return this.request<TranspileResult>({ action: "transpile", code, debugSteps }, signal);
  }

  /**
   * O programa tem erro de compilação e não executa: o mesmo critério do executor.
   */
  hasCompileErrors(result: CheckResult) {
    return (
      result.parseErrors.length > 0 ||
      result.diagnostics.some(diagnostic => diagnostic.severity === PortugolDiagnosticSeverity.Error)
    );
  }

  private request<T>(message: Request["message"], signal?: AbortSignal) {
    return new Promise<T>((resolve, reject) => {
      if (signal?.aborted) {
        reject(this.abortError());
        return;
      }

      const id = Math.random().toString(36).slice(2, 9);
      const onAbort = () => {
        this.abort(id);
      };

      // O sinal pode viver mais que o pedido (o da correção de um exercício, por exemplo)
      this.requests.set(id, {
        message,
        started: Date.now(),
        resolve: (data: T) => {
          signal?.removeEventListener("abort", onAbort);
          resolve(data);
        },
        reject: (error: Error) => {
          signal?.removeEventListener("abort", onAbort);
          reject(error);
        },
      });
      this.post(id, message);

      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  private post(id: string, message: Request["message"]) {
    if (!this.worker) {
      const worker = new Worker(`assets/portugol-worker/${WORKER_FILE_NAME}`);

      worker.addEventListener("message", (event: MessageEvent<{ id: string }>) => {
        this.onMessage(event.data);
      });
      // Um erro atrasado de um worker já trocado (pelo abort) não derruba o atual
      worker.addEventListener("error", event => {
        if (worker === this.worker) {
          this.onCrash(event);
        }
      });
      this.worker = worker;
    }

    this.worker.postMessage({ ...message, id });
  }

  private onMessage(data: { id: string }) {
    const request = this.requests.get(data.id);

    if (!request) {
      return;
    }

    this.requests.delete(data.id);
    console.log(
      request.message.action === "check" ? "Checker Result" : "Transpiler Result",
      data,
      `${Date.now() - request.started}ms`,
    );
    request.resolve(data as never);
  }

  /**
   * O worker não tem como parar um pedido no meio: ele é trocado por outro, e os pedidos das
   * outras abas vão para o novo.
   */
  private abort(id: string) {
    const request = this.requests.get(id);

    if (!request) {
      return;
    }

    this.requests.delete(id);
    request.reject(this.abortError());

    this.worker?.terminate();
    this.worker = undefined;

    for (const [otherId, other] of this.requests) {
      this.post(otherId, other.message);
    }
  }

  /**
   * O worker quebrou (falta de memória, um erro ao carregar): nenhum pedido vai ter resposta.
   * Todos falham, e o próximo pedido cria outro worker.
   */
  private onCrash(event: ErrorEvent) {
    this.worker?.terminate();
    this.worker = undefined;

    const error = new Error(`O worker parou: ${event.message || "erro desconhecido"}`);

    error.name = WORKER_CRASH_ERROR;

    for (const request of this.requests.values()) {
      request.reject(error);
    }

    this.requests.clear();
  }

  private abortError() {
    return new DOMException("A transpilação foi interrompida.", "AbortError");
  }
}
