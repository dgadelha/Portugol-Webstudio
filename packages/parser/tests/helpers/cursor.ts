import {
  type AjudaAssinatura,
  ajudaDeAssinatura,
  completar,
  definição,
  informaçãoDoNome,
  type InformaçãoDoNome,
  type ItemCompletar,
  type Posição,
} from "../../src";
import { portugol } from "./code";

const CURSOR = "▮";

/**
 * Tira o `▮` do código e devolve onde ele estava, como uma posição do editor.
 */
export function comCursor(códigoComCursor: string): { código: string; posição: Posição } {
  const índice = códigoComCursor.indexOf(CURSOR);

  if (índice === -1 || códigoComCursor.includes(CURSOR, índice + 1)) {
    throw new Error("O código precisa de um, e só um, ▮");
  }

  const antes = códigoComCursor.slice(0, índice).split("\n");

  return {
    código: códigoComCursor.slice(0, índice) + códigoComCursor.slice(índice + 1),
    posição: { linha: antes.length, coluna: antes.at(-1)!.length + 1 },
  };
}

function lerCursor(strings: TemplateStringsArray | string, values: unknown[]) {
  return comCursor(typeof strings === "string" ? strings : portugol(strings, ...values));
}

export function completarEm(strings: TemplateStringsArray | string, ...values: unknown[]): ItemCompletar[] {
  const { código, posição } = lerCursor(strings, values);

  return completar(código, posição);
}

export function assinaturaEm(strings: TemplateStringsArray | string, ...values: unknown[]): AjudaAssinatura | null {
  const { código, posição } = lerCursor(strings, values);

  return ajudaDeAssinatura(código, posição);
}

export function informaçãoEm(strings: TemplateStringsArray | string, ...values: unknown[]): InformaçãoDoNome | null {
  const { código, posição } = lerCursor(strings, values);

  return informaçãoDoNome(código, posição);
}

/**
 * A definição, com o texto do código no intervalo dela.
 */
export function definiçãoEm(strings: TemplateStringsArray | string, ...values: unknown[]) {
  const { código, posição } = lerCursor(strings, values);
  const encontrada = definição(código, posição);

  if (!encontrada) {
    return null;
  }

  const { linha, início, fim } = encontrada.intervalo;

  return { ...encontrada.intervalo, texto: código.split("\n")[linha - 1].slice(início - 1, fim - 1) };
}

export function rótulos(itens: readonly ItemCompletar[]): string[] {
  return itens.map(item => item.rótulo);
}

export function item(itens: readonly ItemCompletar[], rótulo: string, tipo?: ItemCompletar["tipo"]) {
  return itens.find(i => i.rótulo === rótulo && (tipo === undefined || i.tipo === tipo));
}

/**
 * O parâmetro destacado, pelo trecho do rótulo.
 */
export function parâmetroAtivo(ajuda: AjudaAssinatura | null) {
  const parâmetro = ajuda?.parâmetros[ajuda.parâmetroAtivo];

  return parâmetro && ajuda.rótulo.slice(...parâmetro.rótulo);
}
