import { BIBLIOTECAS_IMPLEMENTADAS, SÍMBOLOS_NÃO_IMPLEMENTADOS } from "./suporte.gerado.js";

/**
 * Quais bibliotecas — e quais símbolos delas — o runtime do Webstudio executa, para o
 * checker acusar já na análise o que hoje estouraria só em execução. As listas ficam
 * gravadas em `suporte.gerado.ts` para o parser não depender do pacote `runtime`; regere
 * com `node packages/parser/tools/gerar-suporte.mjs`.
 */
export interface SímbolosNãoImplementados {
  readonly funções: readonly string[];
  readonly constantes: readonly string[];
}

const IMPLEMENTADAS = new Set<string>(BIBLIOTECAS_IMPLEMENTADAS);

/**
 * Escrita à mão: funções reservadas não são bibliotecas e não aparecem nos metadados.
 * `escreva`, `leia` e `limpa` são implementadas; `sorteia` só existe como `Util.sorteia`.
 */
export const FUNÇÕES_RESERVADAS_NÃO_IMPLEMENTADAS: readonly string[] = ["sorteia"];

export function bibliotecaImplementada(nome: string): boolean {
  return IMPLEMENTADAS.has(nome);
}

export function símbolosNãoImplementados(biblioteca: string): SímbolosNãoImplementados | undefined {
  return Object.hasOwn(SÍMBOLOS_NÃO_IMPLEMENTADOS, biblioteca)
    ? (SÍMBOLOS_NÃO_IMPLEMENTADOS as Readonly<Record<string, SímbolosNãoImplementados>>)[biblioteca]
    : undefined;
}

/**
 * Não checa se a função existe no Portugol Studio — para isso, `obterFunção` de
 * `metadados.ts`.
 */
export function funçãoImplementada(biblioteca: string, funcao: string): boolean {
  return bibliotecaImplementada(biblioteca) && !símbolosNãoImplementados(biblioteca)?.funções.includes(funcao);
}

export function constanteImplementada(biblioteca: string, constante: string): boolean {
  return bibliotecaImplementada(biblioteca) && !símbolosNãoImplementados(biblioteca)?.constantes.includes(constante);
}

export function funçãoReservadaImplementada(nome: string): boolean {
  return !FUNÇÕES_RESERVADAS_NÃO_IMPLEMENTADAS.includes(nome);
}

export { BIBLIOTECAS_IMPLEMENTADAS, SÍMBOLOS_NÃO_IMPLEMENTADOS };
