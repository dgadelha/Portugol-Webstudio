import type { z } from "zod";

import type { Exercício, RascunhoDeExercício } from "./index.js";

export declare const URL_DO_ESQUEMA: string;

/**
 * Os tópicos, na ordem de um curso, com o nome de cada um.
 */
export declare const tópicos: Record<Exercício["tópico"], string>;

/**
 * O esquema de um exercício: `schema.safeParse(json)` valida um exercício compartilhado.
 */
export declare const schema: z.ZodType<Exercício>;

export declare const URL_DO_ESQUEMA_DO_RASCUNHO: RascunhoDeExercício["$schema"];

/**
 * O esquema do arquivo-fonte que o criador de exercícios baixa (com a solução).
 */
export declare const esquemaDoRascunho: z.ZodType<RascunhoDeExercício>;
