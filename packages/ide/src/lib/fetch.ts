/**
 * `fetch` que tenta de novo com espera crescente: os recursos vêm do service worker ou da rede,
 * e uma falha passageira não deve deixar a tela vazia.
 */
export async function fetchWithRetry(url: string, { retries = 3, signal }: { retries?: number; signal?: AbortSignal } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ao carregar ${url}`);
      }

      return response;
    } catch (error) {
      if (signal?.aborted || attempt >= retries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
}

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  return (await fetchWithRetry(url, { signal })).json() as Promise<T>;
}

export async function fetchText(url: string, signal?: AbortSignal) {
  return (await fetchWithRetry(url, { signal })).text();
}
