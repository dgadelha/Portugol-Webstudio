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
  const comentários: string[] = [];
  let quebras = 0;

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

    if (quebras + própria > 1 || !começaALinha(tokens, i)) {
      break;
    }

    comentários.unshift(textoDoComentário(anterior.text ?? ""));
    quebras = 0;
  }

  const texto = comentários.join("\n").trim();

  return texto || undefined;
}

function começaALinha(tokens: readonly Token[], índice: number) {
  for (let i = índice - 1; i >= 0; i--) {
    const anterior = tokens[i];

    if (
      anterior.type === PortugolLexer.COMENTARIO_SIMPLES ||
      (anterior.type === PortugolLexer.WS && contarQuebras(anterior.text) > 0)
    ) {
      return true;
    }

    if (anterior.channel === Token.DEFAULT_CHANNEL) {
      return false;
    }
  }

  return true;
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
 * Linhas só de traços, iguais ou asteriscos, que separam partes do código.
 */
const LINHA_DE_ENFEITE = /^[-=*_#~+/\\|.]+$/;

/**
 * O texto do comentário, sem `//`, `/*`, `*\/` nem o `*` do começo das linhas.
 */
export function textoDoComentário(comentário: string) {
  const texto = comentário.startsWith("//")
    ? comentário.replace(/^\/+/, "")
    : comentário.replace(/^\/\*+/, "").replace(/\*+\/$/, "");

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
