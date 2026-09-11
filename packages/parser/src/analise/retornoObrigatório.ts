import { type Comando, EscolhaCmd, type Expressão, PareCmd, RetorneCmd, SeCmd } from "../nodes/index.js";

/**
 * Porta de `analise/semantica/AnalisadorRetornoDeFuncao.java`: todo caminho do corpo passa
 * por um `retorne`? Laço nenhum conta, nem `enquanto (verdadeiro)` — como no Java, a
 * análise não avalia condições.
 */
export function possuiRetornoObrigatório(blocos: ReadonlyArray<Comando | Expressão>): boolean {
  return blocos.some(bloco => blocoGaranteRetorno(bloco));
}

function blocoGaranteRetorno(bloco: Comando | Expressão): boolean {
  if (bloco instanceof RetorneCmd) {
    // `retorne` sem expressão também conta: o Java devolve `true` nos dois ramos.
    return true;
  }

  if (bloco instanceof SeCmd) {
    // Sem `senao` não há garantia — é o que faz `se ... senao se ...` não contar.
    if (!bloco.senão) {
      return false;
    }

    return possuiRetornoObrigatório(bloco.instruções) && possuiRetornoObrigatório(bloco.senão.instruções);
  }

  if (bloco instanceof EscolhaCmd) {
    return escolhaGaranteRetorno(bloco);
  }

  return false;
}

function escolhaGaranteRetorno(nó: EscolhaCmd): boolean {
  const último = nó.casos.at(-1);

  // Sem `caso contrario` no fim, existe o caminho em que nenhum caso casa. (O Java
  // estoura `IndexOutOfBounds` quando não há caso nenhum; aqui isso é só "não garante".)
  if (!último?.contrário) {
    return false;
  }

  return nó.casos.every(caso => {
    // Só os comandos antes do `pare` contam: depois dele o caso já saiu do `escolha`.
    const pare = caso.instruções.findIndex(instrução => instrução instanceof PareCmd);

    return possuiRetornoObrigatório(pare === -1 ? caso.instruções : caso.instruções.slice(0, pare));
  });
}
