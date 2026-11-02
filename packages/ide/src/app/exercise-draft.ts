import type { RascunhoDeExercício } from "@portugol-webstudio/resources/exercicios";

import { isMeaningfulCode } from "./workspace.types";

/**
 * Um exercício em construção: tudo o que quem cria precisa para editar de novo, inclusive a
 * solução, que nunca vai para o link. O tipo vem de `esquemaDoRascunho` em `resources`.
 */
export type ExerciseDraft = RascunhoDeExercício;
export type DraftCase = ExerciseDraft["casos"][number];
export type DraftCheck = DraftCase["verificações"][number];
export type DraftWriteCheck = Extract<DraftCheck, { alvo: "escreva" }>;
export type DraftFunctionCheck = Extract<DraftCheck, { alvo: "função" }>;

/**
 * O `$schema` do arquivo-fonte de um exercício: o que "Baixar" grava e "Abrir" reconhece. Como
 * no exercício, ele diz a versão do formato. Escrito aqui porque o `URL_DO_ESQUEMA_DO_RASCUNHO`
 * de `resources` vem com o zod, que só é carregado sob demanda; o tipo garante que é o mesmo.
 */
const DRAFT_SCHEMA: ExerciseDraft["$schema"] = "https://portugol.dev/esquemas/rascunho-de-exercicio/v1.json";

/**
 * O nome da aba e do cabeçalho enquanto o exercício não tem título.
 */
const UNTITLED = "Novo exercício";

/**
 * Um exercício novo: a solução e o código inicial começam com o programa de uma aba nova
 * (`code`, na indentação escolhida).
 */
export function emptyDraft(code: string): ExerciseDraft {
  return {
    $schema: DRAFT_SCHEMA,
    título: "",
    tópico: "saida",
    dificuldade: 1,
    enunciado: "",
    códigoInicial: code,
    solução: code,
    modo: "simples",
    casos: [
      { tipo: "exemplo", descrição: "", entradas: "", verificações: [] },
      { tipo: "teste", descrição: "", entradas: "", verificações: [] },
    ],
  };
}

/**
 * Um rascunho gravado pela própria aba, ou `null` se o texto não for um. Um arquivo aberto
 * passa antes pelo `readDraftFile`.
 */
export function parseDraft(text: string): ExerciseDraft | null {
  try {
    const data = JSON.parse(text) as Partial<ExerciseDraft> | null;

    return data?.$schema === DRAFT_SCHEMA && Array.isArray(data.casos) ? (data as ExerciseDraft) : null;
  } catch {
    return null;
  }
}

/**
 * Um arquivo aberto pelo "Abrir": um rascunho que segue o esquema, um rascunho com erros
 * (`invalid`), ou `null` se não for um rascunho. Um arquivo editado à mão pode ter qualquer
 * coisa, e a aba de criação conta com o formato. O esquema (com o zod) só é baixado quando o
 * arquivo parece um rascunho.
 */
export async function readDraftFile(
  fileName: string,
  text: string,
): Promise<"invalid" | null | { draft: ExerciseDraft }> {
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    return fileName.toLowerCase().endsWith(".exercicio.json") ? "invalid" : null;
  }

  if ((data as Partial<ExerciseDraft> | null)?.$schema !== DRAFT_SCHEMA) {
    return null;
  }

  const { esquemaDoRascunho } = await import("@portugol-webstudio/resources/exercicios/esquema");
  const result = esquemaDoRascunho.safeParse(data);

  return result.success ? { draft: result.data } : "invalid";
}

/**
 * Se o rascunho tem algo além do que uma aba nova traz: fechar a aba perderia trabalho.
 */
export function isMeaningfulDraft(text: string) {
  const draft = parseDraft(text);

  if (draft === null) {
    return false;
  }

  const empty = emptyDraft("");

  return Boolean(
    draft.título.trim() ||
    draft.enunciado.trim() ||
    isMeaningfulCode(draft.códigoInicial) ||
    isMeaningfulCode(draft.solução) ||
    draft.tópico !== empty.tópico ||
    draft.dificuldade !== empty.dificuldade ||
    draft.modo !== empty.modo ||
    draft.casos.length !== empty.casos.length ||
    draft.casos.some(
      (caso, i) =>
        caso.tipo !== empty.casos[i]?.tipo || caso.entradas || caso.descrição || caso.verificações.length > 0,
    ),
  );
}

/**
 * O título do exercício, ou "Novo exercício" enquanto não tem um.
 */
export function draftTitle(draft: ExerciseDraft) {
  return draft.título.trim() || UNTITLED;
}
