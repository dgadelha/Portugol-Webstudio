import type { Intervalo, Posição } from "./contexto.js";
import { intervaloDoToken, resolverNome } from "./resolução.js";

export interface Definição {
  /**
   * O nome na declaração, no mesmo código.
   */
  intervalo: Intervalo;
}

/**
 * Onde o nome na posição foi declarado. As funções e constantes das bibliotecas e da linguagem
 * não têm declaração no código: nada.
 */
export function definição(código: string, posição: Posição): Definição | null {
  const resolvido = resolverNome(código, posição);

  if (!resolvido) {
    return null;
  }

  const { significado, nome, lido, linhas } = resolvido;
  const em = (índice: number) => ({ intervalo: intervaloDoToken(lido.tokens[índice], linhas) });

  switch (significado.tipo) {
    case "símbolo": {
      return em(significado.símbolo.índices.nome);
    }

    case "biblioteca": {
      const { incluída } = significado;

      // Com apelido, o `índiceDoApelido` sempre existe.
      return em(nome === incluída.alias ? incluída.índiceDoApelido! : incluída.índice);
    }

    default: {
      return null;
    }
  }
}
