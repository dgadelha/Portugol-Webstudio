import { PortugolLexer } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import type { SímboloDeclarado } from "./símbolos.js";

/**
 * O comentário da declaração, sem as marcas: o de cima do nome (numa lista com um nome por
 * linha) ou o de cima da declaração inteira, e o do fim da linha. Só a informação o pede, para
 * o nome sob o mouse.
 */
export function comentárioDe({ índices }: SímboloDeclarado, tokens: readonly Token[]) {
  // A função: só o de cima, já que a linha dela continua no corpo.
  if (índices.fim === undefined) {
    return acima(tokens, índices.início);
  }

  const emCima = acima(tokens, índices.nome) ?? acima(tokens, índices.início);
  const noFim = noFimDaLinha(tokens, índices.fim);

  return emCima && noFim ? `${emCima}\n\n${noFim}` : (emCima ?? noFim);
}

/**
 * Os comentários logo acima do token, sem linha em branco no meio: um bloco, ou vários `//`
 * seguidos. O comentário no fim da linha de outro comando é desse comando, e não conta.
 */
function acima(tokens: readonly Token[], índice: number) {
  // O primeiro comentário aceito: andando para trás, os aceitos ficam juntos até ele.
  let primeiro = índice;
  let quebras = 0;
  // O token abaixo do comentário que decide se ele começa a linha, e a resposta. Os comentários
  // entre ele e o atual têm a mesma: procurar de novo para cada um levaria segundos com
  // milhares de comentários seguidos.
  let decisivo = Infinity;
  let começa = true;

  for (let i = índice - 1; i >= 0; i--) {
    const anterior = tokens[i];

    if (anterior.channel === Token.DEFAULT_CHANNEL) {
      break;
    }

    if (anterior.type === PortugolLexer.WS) {
      quebras += contarQuebras(anterior.text);

      if (quebras > 1) {
        break;
      }

      continue;
    }

    // O `//` termina com a quebra de linha.
    const própria = anterior.type === PortugolLexer.COMENTARIO_SIMPLES && anterior.text?.endsWith("\n") ? 1 : 0;

    if (i <= decisivo) {
      ({ decisivo, começa } = começoDaLinha(tokens, i));
    }

    if (!começa || quebras + própria > 1) {
      break;
    }

    primeiro = i;
    quebras = 0;
  }

  const texto = tokens
    .slice(primeiro, índice)
    .filter(token => token.type !== PortugolLexer.WS)
    .map(token => textoDoComentário(token.text ?? ""))
    .join("\n")
    .trim();

  return texto || undefined;
}

/**
 * Se o token começa a linha, e o token antes dele que decide: um `//` ou uma quebra de linha
 * (começa), ou código (não começa). Sem nenhum antes, é o começo do arquivo (-1).
 */
function começoDaLinha(tokens: readonly Token[], índice: number) {
  for (let i = índice - 1; i >= 0; i--) {
    const anterior = tokens[i];

    if (
      anterior.type === PortugolLexer.COMENTARIO_SIMPLES ||
      (anterior.type === PortugolLexer.WS && contarQuebras(anterior.text) > 0)
    ) {
      return { decisivo: i, começa: true };
    }

    if (anterior.channel === Token.DEFAULT_CHANNEL) {
      return { decisivo: i, começa: false };
    }
  }

  return { decisivo: -1, começa: true };
}

/**
 * O comentário na mesma linha, depois da declaração e da vírgula que a separa da próxima.
 */
function noFimDaLinha(tokens: readonly Token[], índice: number) {
  let vírgula = false;

  for (let i = índice + 1; i < tokens.length; i++) {
    const seguinte = tokens[i];

    if (seguinte.type === PortugolLexer.WS) {
      if (contarQuebras(seguinte.text) > 0) {
        return;
      }

      continue;
    }

    if (!vírgula && seguinte.type === PortugolLexer.VIRGULA) {
      vírgula = true;
      continue;
    }

    if (seguinte.type === PortugolLexer.COMENTARIO || seguinte.type === PortugolLexer.COMENTARIO_SIMPLES) {
      return textoDoComentário(seguinte.text ?? "") || undefined;
    }

    return;
  }

  return;
}

function contarQuebras(texto: string | undefined) {
  return (texto ?? "").split("\n").length - 1;
}

/**
 * O comentário de bloco sem o `/*` e o `*\/`, com os asteriscos colados neles. Sem expressão
 * regular: a `\*+\/$` testaria cada asterisco de uma sequência longa no meio do texto, e
 * milhares deles levariam segundos.
 */
function semAsPontasDoBloco(comentário: string) {
  let início = 1;
  let fim = comentário.endsWith("*/") ? comentário.length - 2 : comentário.length;

  while (início < fim && comentário[início] === "*") {
    início++;
  }

  while (fim > início && comentário[fim - 1] === "*") {
    fim--;
  }

  return comentário.slice(início, fim);
}

/**
 * Linhas só de traços, iguais ou asteriscos, que separam partes do código.
 */
const LINHA_DE_ENFEITE = /^[-=*_#~+/\\|.─━═]+$/u;

/**
 * O texto do comentário, sem `//`, `/*`, `*\/` nem o `*` do começo das linhas.
 */
export function textoDoComentário(comentário: string) {
  const texto = comentário.startsWith("//") ? comentário.replace(/^\/+/, "") : semAsPontasDoBloco(comentário);

  return texto
    .split(/\r?\n/)
    .map(linha => {
      return linha
        .trim()
        .replace(/^\*+ ?/, "")
        .trim();
    })
    .filter(linha => !LINHA_DE_ENFEITE.test(linha))
    .join("\n")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();
}
