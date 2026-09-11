import type { Token } from "antlr4ng";

import type { Parâmetro } from "../nodes/index.js";
import type { TipoPrimitivo } from "./TipoDado.js";

/**
 * Corresponde às quatro classes de `nucleo/simbolos` do Portugol Studio (`Variavel`,
 * `Vetor`, `Matriz`, `Funcao`), que é o que decide o texto de várias mensagens.
 */
export type ClasseSímbolo = "função" | "matriz" | "variável" | "vetor";

export type ClasseDado = Exclude<ClasseSímbolo, "função">;

interface SímboloBase {
  readonly classe: ClasseSímbolo;
  readonly nome: string;
  readonly tipo: TipoPrimitivo;

  /**
   * Ausente só nas funções reservadas da linguagem, que não têm declaração no código-fonte;
   * sem ele `ErroSimboloRedeclarado` sai sem o sufixo ", na linha: L, coluna: C.", igual ao
   * Portugol Studio.
   */
  readonly nomeToken?: Token;

  constante: boolean;

  /**
   * Ligado quando uma atribuição ao símbolo é **visitada** — não é análise de fluxo.
   */
  inicializado: boolean;

  /**
   * O símbolo redeclarado continua existindo, para não cascatear "não declarado", mas não entra na memória.
   */
  redeclarado: boolean;

  /**
   * Só quando a constante é inteira e calculável: é o que permite `inteiro v[N]`.
   */
  valorInteiro?: number;

  /**
   * Base dos avisos de uso (#15): parâmetros e declarações com inicialização já nascem com
   * uma escrita; parâmetros por referência, também com uma leitura.
   */
  leituras: number;
  escritas: number;
}

export interface SímboloDado extends SímboloBase {
  readonly classe: ClasseDado;
}

export interface SímboloFunção extends SímboloBase {
  readonly classe: "função";
  readonly parâmetros: readonly Parâmetro[];
}

export type Símbolo = SímboloDado | SímboloFunção;

const CONTADORES = { redeclarado: false, leituras: 0, escritas: 0 } as const;

/**
 * `Vetor` e `Matriz` no Java chamam `setInicializado(true)` no construtor, `Variavel` não:
 * é por isso que `inteiro v[3]` não acusa "não inicializado" e `inteiro x` acusa.
 */
export function criarDado(classe: ClasseDado, nome: string, tipo: TipoPrimitivo, nomeToken?: Token): SímboloDado {
  return { classe, nome, tipo, nomeToken, ...CONTADORES, constante: false, inicializado: classe !== "variável" };
}

export function criarFunção(
  nome: string,
  tipo: TipoPrimitivo,
  opções: { nomeToken?: Token; parâmetros?: readonly Parâmetro[] } = {},
): SímboloFunção {
  return {
    classe: "função",
    nome,
    tipo,
    nomeToken: opções.nomeToken,
    ...CONTADORES,
    constante: true,
    inicializado: false,
    parâmetros: opções.parâmetros ?? [],
  };
}
