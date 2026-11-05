import type { Intervalo, Posição } from "./contexto.js";
import { assinaturaEExplicação, intervaloDoToken, páginaDaAjuda, resolverNome, type Significado } from "./resolução.js";

export type Definição =
  | {
      /**
       * O nome na declaração, no mesmo código.
       */
      intervalo: Intervalo;
    }
  | {
      /**
       * A página da Ajuda, como nos endereços `#ajuda=`, de uma biblioteca, de uma função ou
       * constante dela, ou de uma função da linguagem: elas não têm declaração no código.
       */
      ajuda: string;
      declaração: DeclaraçãoNaAjuda;
    };

/**
 * O que não é declarado no código escrito como se fosse, para o editor mostrar onde a definição
 * não abre a Ajuda (a prévia com o Ctrl e o Peek): a explicação em comentários e, depois, a
 * assinatura, com a mesma explicação e assinatura da informação.
 */
export interface DeclaraçãoNaAjuda {
  texto: string;
  /**
   * O nome na assinatura, na última linha do texto.
   */
  intervalo: Intervalo;
}

/**
 * Onde o nome na posição foi declarado ou, para o que vem das bibliotecas e da linguagem, a
 * página dele na Ajuda. Sem página (uma biblioteca que o Webstudio não executa, o `sorteia`),
 * nada.
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

      // O apelido usado no código vai para o `inclua`, como uma variável. O nome da biblioteca,
      // ou o apelido no próprio `inclua`, vai para a página dela na Ajuda.
      if (nome === incluída.alias) {
        // Com apelido, o `índiceDoApelido` sempre existe.
        const apelido = em(incluída.índiceDoApelido!);
        const noInclua =
          apelido.intervalo.linha === resolvido.intervalo.linha &&
          apelido.intervalo.início === resolvido.intervalo.início;

        if (!noInclua) {
          return apelido;
        }
      }

      const ajuda = páginaDaAjuda(significado);

      return ajuda ? { ajuda, declaração: declaraçãoNaAjuda(significado) } : em(incluída.índice);
    }

    default: {
      const ajuda = páginaDaAjuda(significado);

      return ajuda ? { ajuda, declaração: declaraçãoNaAjuda(significado) } : null;
    }
  }
}

function declaraçãoNaAjuda(
  significado: Extract<Significado, { tipo: "função" | "constante" | "biblioteca" }>,
): DeclaraçãoNaAjuda {
  const { nome, assinatura, explicação } = assinaturaEExplicação(significado);
  const comentário = explicação ? explicação.split("\n").map(linha => (linha ? `// ${linha}` : "//")) : [];
  // O nome de uma função vem antes do parêntese; o de uma constante ou biblioteca, no fim.
  const coluna = significado.tipo === "função" ? assinatura.indexOf(`${nome}(`) : assinatura.length - nome.length;

  return {
    texto: [...comentário, assinatura].join("\n"),
    intervalo: { linha: comentário.length + 1, início: coluna + 1, fim: coluna + 1 + nome.length },
  };
}
