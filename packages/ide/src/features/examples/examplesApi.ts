import { fetchJson, fetchText } from "@/lib/fetch";

const BASE_URL = "/assets/recursos/exemplos";

export interface ExampleItem {
  id: string;
  name: string;
  type: string;
  file?: string;
  description?: string;
  hasImage?: boolean;
  image?: string;
  dir?: string;
  children?: ExampleItem[];
}

/**
 * Um exemplo com o caminho das pastas onde ele está, para agrupar e buscar.
 */
export interface ExampleEntry {
  item: ExampleItem;
  category: string;
  path: string[];
}

export function fetchExamplesIndex(signal?: AbortSignal) {
  return fetchJson<ExampleItem[]>(`${BASE_URL}/index.json`, signal);
}

export function fetchExampleCode(item: ExampleItem, signal?: AbortSignal) {
  return fetchText(`${BASE_URL}/${item.file}`, signal);
}

/**
 * Achata a árvore de exemplos: cada arquivo vira uma entrada com a sua categoria (a pasta de
 * primeiro nível) e as subpastas.
 */
export function flattenExamples(items: ExampleItem[], parents: string[] = []): ExampleEntry[] {
  return items.flatMap(item => {
    if (item.children?.length) {
      return flattenExamples(item.children, [...parents, item.name]);
    }

    if (!item.file) {
      return [];
    }

    return [{ item, category: parents[0] ?? "Exemplos", path: parents.slice(1) }];
  });
}

/**
 * Os exemplos começam com um comentário de cabeçalho (autor, descrição…); a prévia mostra só o código.
 */
export function stripExampleHeader(code: string) {
  const commentEnd = code.indexOf("*/");

  return (commentEnd === -1 ? code : code.slice(commentEnd + 2)).trim();
}
