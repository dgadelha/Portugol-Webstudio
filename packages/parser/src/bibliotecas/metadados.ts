import { bibliotecas as bibliotecasRecursos } from "@portugol-recursos/bibliotecas";

import { TIPO_TODOS, type TipoOperando } from "../analise/TipoDado.js";
import type { NomeBiblioteca } from "./suporte.gerado.js";

export type Biblioteca = (typeof bibliotecasRecursos)[number];
export type FunçãoBiblioteca = Biblioteca["funções"][number];
export type ConstanteBiblioteca = Biblioteca["constantes"][number];
type TipoBiblioteca = FunçãoBiblioteca["retorno"]["tipo"];

/**
 * O `@portugol-recursos/bibliotecas` escreve o curinga como `"*"`; as tabelas de
 * compatibilidade o indexam como `todos`.
 */
export function tipoDaBiblioteca(tipo: TipoBiblioteca): TipoOperando {
  return (tipo.primitivo === "*" ? TIPO_TODOS : tipo.primitivo) as TipoOperando;
}

interface Índice {
  readonly biblioteca: Biblioteca;
  readonly constantes: ReadonlyMap<string, ConstanteBiblioteca>;
  readonly funções: ReadonlyMap<string, FunçãoBiblioteca>;
}

// O recursos entrega listas; sem índice, cada chamada de biblioteca varreria até 55 funções.
const ÍNDICE: ReadonlyMap<string, Índice> = new Map(
  bibliotecasRecursos.map(biblioteca => {
    return [
      biblioteca.nome,
      {
        biblioteca,
        constantes: new Map(biblioteca.constantes.map(constante => [constante.nome, constante])),
        funções: new Map(biblioteca.funções.map(função => [função.nome, função])),
      },
    ];
  }),
);

export function obterBiblioteca(nome: string): Biblioteca | undefined {
  return ÍNDICE.get(nome)?.biblioteca;
}

export function obterFunção(biblioteca: string, função: string): FunçãoBiblioteca | undefined {
  return ÍNDICE.get(biblioteca)?.funções.get(função);
}

export function obterConstante(biblioteca: string, constante: string): ConstanteBiblioteca | undefined {
  return ÍNDICE.get(biblioteca)?.constantes.get(constante);
}

export type { NomeBiblioteca };
