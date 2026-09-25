import { type DependencyList, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: unknown };

/**
 * Executa uma tarefa assíncrona quando o componente monta (ou as dependências mudam), cancelando
 * a anterior. Para mostrar "carregando" de novo ao trocar de tarefa, remonte o componente com
 * uma `key` diferente.
 */
export function useAsync<T>(task: (signal: AbortSignal) => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    task(controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", error });
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as dependências são as do chamador
  }, deps);

  return state;
}
