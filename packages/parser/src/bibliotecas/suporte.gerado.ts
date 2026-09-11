// ARQUIVO GERADO — não edite à mão.
//
// Cruza `@portugol-recursos/bibliotecas` (o que a linguagem tem) com
// packages/runtime/src/libs (o que o runtime do Webstudio executa).
// Regere com, a partir da raiz do repositório:
//
//   node packages/parser/tools/gerar-suporte.mjs

import type { SímbolosNãoImplementados } from "./suporte.js";

export type NomeBiblioteca =
  | "Arquivos"
  | "Calendario"
  | "Graficos"
  | "Internet"
  | "Matematica"
  | "Mouse"
  | "Objetos"
  | "ServicosWeb"
  | "Sons"
  | "Teclado"
  | "Texto"
  | "Tipos"
  | "Util";

/**
 * Bibliotecas cujo código o runtime do Webstudio injeta (`packages/runtime/src/libs`).
 */
export const BIBLIOTECAS_IMPLEMENTADAS: readonly NomeBiblioteca[] = [
  "Calendario",
  "Graficos",
  "Matematica",
  "Objetos",
  "Texto",
  "Tipos",
  "Util",
];

/**
 * Símbolos que faltam *dentro* de cada biblioteca implementada. As listas vazias existem
 * para a diferença aparecer no diff assim que a linguagem ganhar um símbolo novo.
 */
export const SÍMBOLOS_NÃO_IMPLEMENTADOS: Readonly<Partial<Record<NomeBiblioteca, SímbolosNãoImplementados>>> = {
  "Calendario": { funções: [], constantes: [] },
  "Graficos": { funções: [], constantes: [] },
  "Matematica": { funções: [], constantes: [] },
  "Objetos": { funções: [], constantes: [] },
  "Texto": { funções: [], constantes: [] },
  "Tipos": { funções: [], constantes: [] },
  "Util": { funções: [], constantes: [] },
};
