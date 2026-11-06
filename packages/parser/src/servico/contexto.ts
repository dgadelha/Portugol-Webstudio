import { PortugolLexer } from "@portugol-webstudio/antlr";
import { type ATNSimulator, BaseErrorListener, CharStream, CommonTokenStream, type Recognizer, Token } from "antlr4ng";

import { barraDeComentárioSemFim } from "../analise/AnalisadorSintático.js";

/**
 * Uma posição no código, como no Monaco: linha e coluna começam em 1, e a coluna conta
 * unidades de UTF-16.
 */
export interface Posição {
  linha: number;
  coluna: number;
}

/**
 * Um nome numa linha do código. As colunas são como as de `Posição` (UTF-16, a partir de 1), e
 * `fim` é a coluna logo depois do nome.
 */
export interface Intervalo {
  linha: number;
  início: number;
  fim: number;
}

/**
 * O tipo de bloco que uma `{` abre, pelo token antes dela.
 */
export type TipoBloco =
  | "programa"
  | "função"
  | "se"
  | "senao"
  | "enquanto"
  | "para"
  | "faca"
  | "escolha"
  | "caso"
  | "inicialização"
  | "outro";

interface Abertura {
  token: Token;
  /**
   * A posição do token na lista.
   */
  índice: number;
  bloco?: TipoBloco;
}

/**
 * O que cabe no cursor, decidido pelos tokens antes dele.
 */
export type Lugar =
  | { tipo: "nada" }
  | { tipo: "foraDoPrograma" }
  | { tipo: "inclua" }
  | { tipo: "nomeDaBiblioteca" }
  | { tipo: "membro"; biblioteca: string }
  | { tipo: "tipos" }
  | {
      tipo: "código";
      /**
       * Fora de qualquer função, entre as declarações do programa.
       */
      noPrograma: boolean;
      /**
       * Onde cabe um valor, e não um comando: depois de um operador, dentro de parênteses.
       */
      expressão: boolean;
      /**
       * Logo depois de `para (`: a declaração da variável do laço.
       */
      inícioDoPara: boolean;
      depoisDoSe: boolean;
      depoisDoCaso: boolean;
      emEscolha: boolean;
      /**
       * Num laço ou num `escolha`, onde o `pare` vale.
       */
      cabePare: boolean;
    };

export interface Contexto {
  lugar: Lugar;
  /**
   * A palavra que está sendo escrita, até o cursor, e onde ela começa e termina na linha
   * (colunas como as de `Posição`). Sem palavra, as duas colunas são a do cursor.
   */
  palavra: string;
  colunaInicial: number;
  colunaFinal: number;
  /**
   * O texto da linha depois da palavra: com um `(` logo em seguida, a função já tem os
   * parênteses.
   */
  depoisDaPalavra: string;
  /**
   * A posição do cursor contada em pontos de código, como as posições dos tokens do ANTLR.
   */
  deslocamento: number;
  /**
   * Os tokens visíveis antes do cursor, sem a palavra que está sendo escrita.
   */
  tokens: Token[];
  emTextoOuComentário: boolean;
}

/**
 * Onde o léxico desistiu de uma cadeia ou de um caractere: a aspa que não fechou.
 */
class AspasAbertas extends BaseErrorListener {
  readonly posições: Array<{ linha: number; coluna: number }> = [];

  override syntaxError<T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    _offendingSymbol: unknown,
    linha: number,
    coluna: number,
    msg: string,
  ) {
    if (/^token recognition error at: '["']/.test(msg)) {
      this.posições.push({ linha, coluna });
    }
  }
}

const PALAVRA = /^[A-Z_a-z]\w*$/;
// Os nomes do Portugol não têm acentos, mas quem escreve `senão` ou `média` está escrevendo
// uma palavra só: a letra acentuada não pode cortar a palavra ao meio.
const CARACTERE_DE_NOME = /[\p{L}\p{M}\p{N}_]/u;
const NÚMEROS = new Set([PortugolLexer.INT, PortugolLexer.REAL, PortugolLexer.HEXADECIMAL]);

/**
 * Tokens que terminam um valor: depois deles, numa linha nova, começa outro comando.
 */
const FIM_DE_VALOR = new Set([
  PortugolLexer.ID,
  PortugolLexer.INT,
  PortugolLexer.REAL,
  PortugolLexer.HEXADECIMAL,
  PortugolLexer.STRING,
  PortugolLexer.CARACTER,
  PortugolLexer.LOGICO,
  PortugolLexer.FECHA_PARENTESES,
  PortugolLexer.FECHA_COLCHETES,
  PortugolLexer.FECHA_CHAVES,
  PortugolLexer.OP_INCREMENTO_UNARIO,
  PortugolLexer.OP_DECREMENTO_UNARIO,
  PortugolLexer.PARE,
  PortugolLexer.RETORNE,
]);

/**
 * Tokens depois dos quais vem um comando, na mesma linha ou não.
 */
const ANTES_DE_COMANDO = new Set([
  PortugolLexer.ABRE_CHAVES,
  PortugolLexer.FECHA_CHAVES,
  PortugolLexer.DOISPONTOS,
  PortugolLexer.PONTOVIRGULA,
  PortugolLexer.SENAO,
  PortugolLexer.FACA,
  PortugolLexer.PARE,
]);

/**
 * Os comandos com parênteses antes do bloco.
 */
export const BLOCO_DO_COMANDO: ReadonlyMap<number, TipoBloco> = new Map<number, TipoBloco>([
  [PortugolLexer.SE, "se"],
  [PortugolLexer.ENQUANTO, "enquanto"],
  [PortugolLexer.PARA, "para"],
  [PortugolLexer.ESCOLHA, "escolha"],
]);

/**
 * Os tokens do texto, os escondidos também, e as aspas que ficaram abertas.
 */
function lerTokens(texto: string) {
  const entrada = CharStream.fromString(texto);
  const lexer = new PortugolLexer(entrada);
  const aspas = new AspasAbertas();

  lexer.removeErrorListeners();
  lexer.addErrorListener(aspas);

  const fluxo = new CommonTokenStream(lexer);

  fluxo.fill();

  return {
    tokens: fluxo.getTokens().filter(token => token.type !== Token.EOF),
    aspas: aspas.posições,
  };
}

/**
 * A linha em que o token termina: uma cadeia pode ocupar várias.
 */
function linhaFinal(token: Token) {
  return token.line + (token.text?.split("\n").length ?? 1) - 1;
}

/**
 * O que cabe na posição. Só os tokens antes do cursor contam: o código depois dele, quase
 * sempre, ainda é o de antes da edição.
 */
export function analisarContexto(código: string, posição: Posição): Contexto {
  const linhas = código.split("\n");
  const linhaDoCursor = linhas[posição.linha - 1] ?? "";
  const prefixo = [...linhas.slice(0, posição.linha - 1), linhaDoCursor.slice(0, posição.coluna - 1)].join("\n");

  let colunaInicial = posição.coluna;
  let colunaFinal = posição.coluna;

  while (colunaInicial > 1 && CARACTERE_DE_NOME.test(linhaDoCursor[colunaInicial - 2])) {
    colunaInicial--;
  }

  while (colunaFinal <= linhaDoCursor.length && CARACTERE_DE_NOME.test(linhaDoCursor[colunaFinal - 1])) {
    colunaFinal++;
  }

  const palavra = linhaDoCursor.slice(colunaInicial - 1, posição.coluna - 1);
  // O léxico parte a palavra com acento em pedaços (`m`, `é`, `d`): os tokens vão até antes dela.
  const comAcento = /^\D/.test(palavra) && !/^\w*$/.test(palavra);
  const { tokens, aspas } = lerTokens(comAcento ? prefixo.slice(0, prefixo.length - palavra.length) : prefixo);
  const fim = Array.from(prefixo).length;
  const visíveis = tokens.filter(token => token.channel === Token.DEFAULT_CHANNEL);
  const último = tokens.at(-1);

  const base = {
    palavra,
    colunaInicial,
    colunaFinal,
    depoisDaPalavra: linhaDoCursor.slice(colunaFinal - 1),
    deslocamento: fim,
  };

  const últimoVisível = visíveis.at(-1);
  const colado = !comAcento && últimoVisível !== undefined && últimoVisível.stop === fim - 1;
  const parcial = colado && PALAVRA.test(últimoVisível.text ?? "") ? últimoVisível : undefined;
  const antes = parcial ? visíveis.slice(0, -1) : visíveis;
  const nada = { lugar: { tipo: "nada" } as const, ...base, tokens: antes, emTextoOuComentário: false };

  if (dentroDeComentárioOuTexto(último, visíveis, aspas, posição.linha)) {
    return { ...nada, emTextoOuComentário: true };
  }

  // Um número sendo escrito, ou uma palavra colada a ele (`12ab`).
  const anterior = antes.at(-1);

  if (
    (colado && NÚMEROS.has(últimoVisível.type)) ||
    (parcial && anterior && NÚMEROS.has(anterior.type) && anterior.stop + 1 === parcial.start)
  ) {
    return nada;
  }

  return { ...nada, lugar: decidirLugar(antes, posição.linha) };
}

function dentroDeComentárioOuTexto(
  último: Token | undefined,
  visíveis: Token[],
  aspas: Array<{ linha: number }>,
  linha: number,
) {
  // O comentário de linha vai até o fim do texto, que é o cursor.
  if (último?.type === PortugolLexer.COMENTARIO_SIMPLES && !último.text?.endsWith("\n")) {
    return true;
  }

  // Como no editor, a cadeia sem fim acaba com a linha.
  return barraDeComentárioSemFim(visíveis) !== undefined || aspas.some(aspa => aspa.linha === linha);
}

function decidirLugar(tokens: Token[], linhaDoCursor: number): Lugar {
  const anterior = tokens.at(-1);
  const antesDele = tokens.at(-2);
  const nada = { tipo: "nada" } as const;

  switch (anterior?.type) {
    case PortugolLexer.PONTO: {
      return antesDele?.type === PortugolLexer.ID ? { tipo: "membro", biblioteca: antesDele.text ?? "" } : nada;
    }

    case PortugolLexer.BIBLIOTECA: {
      return { tipo: "nomeDaBiblioteca" };
    }

    case PortugolLexer.INCLUA: {
      return { tipo: "inclua" };
    }

    case PortugolLexer.CONSTANTE: {
      return { tipo: "tipos" };
    }

    // Dando nome a algo novo: o apelido da biblioteca, a variável, a função, o parâmetro.
    case PortugolLexer.OP_ALIAS_BIBLIOTECA:
    case PortugolLexer.TIPO:
    case PortugolLexer.FUNCAO:
    case PortugolLexer.PROGRAMA: {
      return nada;
    }

    case PortugolLexer.E_COMERCIAL: {
      if (antesDele?.type === PortugolLexer.TIPO) {
        return nada;
      }

      break;
    }

    default: {
      break;
    }
  }

  const { abertos, últimoBlocoFechado, últimoParêntese } = abrirEFechar(tokens);
  const topo = abertos.at(-1);

  if (abertos.every(aberto => aberto.bloco !== "programa")) {
    return { tipo: "foraDoPrograma" };
  }

  if (topo?.token.type === PortugolLexer.ABRE_PARENTESES) {
    if (éListaDeParâmetros(tokens, topo.índice)) {
      return anterior?.type === PortugolLexer.ABRE_PARENTESES || anterior?.type === PortugolLexer.VIRGULA
        ? { tipo: "tipos" }
        : nada;
    }

    // `para (inteiro i = 0, ▮`: o nome de outra variável do laço.
    if (
      anterior?.type === PortugolLexer.VIRGULA &&
      éCabeçalhoDoPara(tokens, topo.índice) &&
      declaraNoPara(tokens, topo.índice)
    ) {
      return nada;
    }
  }

  const blocos = abertos.filter(aberto => aberto.bloco && aberto.bloco !== "inicialização");
  const blocoAtual = blocos.at(-1);
  const dentroDeBloco = topo === blocoAtual;

  // `inteiro a, ▮`: uma vírgula fora de parênteses só separa declarações.
  if (dentroDeBloco && anterior?.type === PortugolLexer.VIRGULA) {
    return nada;
  }

  const noPrograma = blocos.length === 1;
  const inícioDoPara =
    anterior?.type === PortugolLexer.ABRE_PARENTESES && topo !== undefined && éCabeçalhoDoPara(tokens, topo.índice);

  return {
    tipo: "código",
    noPrograma,
    expressão: !dentroDeBloco || !começaComando(tokens, linhaDoCursor, últimoParêntese),
    inícioDoPara,
    depoisDoSe: anterior?.type === PortugolLexer.FECHA_CHAVES && últimoBlocoFechado === "se",
    depoisDoCaso: anterior?.type === PortugolLexer.CASO,
    emEscolha: blocoAtual?.bloco === "escolha",
    cabePare: blocos.some(aberto => ["enquanto", "para", "faca", "escolha"].includes(aberto.bloco ?? "")),
  };
}

interface Aberturas {
  abertos: Abertura[];
  últimoBlocoFechado?: TipoBloco;
  /**
   * Onde abriu o último parêntese fechado, ou -1.
   */
  últimoParêntese: number;
}

/**
 * Os `(`, `[` e `{` que ficaram abertos antes do cursor, o tipo do último bloco fechado e onde
 * abriu o último parêntese fechado.
 */
function abrirEFechar(tokens: Token[]) {
  const aberturas: Aberturas = { abertos: [], últimoParêntese: -1 };

  for (const índice of tokens.keys()) {
    passarPor(aberturas, tokens, índice);
  }

  return aberturas;
}

function passarPor(aberturas: Aberturas, tokens: Token[], índice: number) {
  const token = tokens[índice];
  const { abertos } = aberturas;

  switch (token.type) {
    case PortugolLexer.ABRE_PARENTESES:
    case PortugolLexer.ABRE_COLCHETES: {
      abertos.push({ token, índice });
      return;
    }

    case PortugolLexer.ABRE_CHAVES: {
      abertos.push({ token, índice, bloco: tipoDoBloco(tokens, índice, abertos.at(-1), aberturas.últimoParêntese) });
      return;
    }

    case PortugolLexer.FECHA_PARENTESES: {
      aberturas.últimoParêntese = abertos.pop()?.índice ?? -1;
      return;
    }

    case PortugolLexer.FECHA_COLCHETES: {
      abertos.pop();
      return;
    }

    case PortugolLexer.FECHA_CHAVES: {
      aberturas.últimoBlocoFechado = abertos.pop()?.bloco;
      return;
    }

    default: {
      return;
    }
  }
}

function tipoDoBloco(tokens: Token[], i: number, fora: Abertura | undefined, últimoParêntese: number): TipoBloco {
  const anterior = tokens[i - 1];

  switch (anterior?.type) {
    case PortugolLexer.PROGRAMA: {
      return "programa";
    }

    case PortugolLexer.SENAO: {
      return "senao";
    }

    case PortugolLexer.FACA: {
      return "faca";
    }

    case PortugolLexer.DOISPONTOS: {
      return "caso";
    }

    case PortugolLexer.OP_ATRIBUICAO: {
      return "inicialização";
    }

    case PortugolLexer.VIRGULA:
    case PortugolLexer.ABRE_CHAVES: {
      return fora?.bloco === "inicialização" ? "inicialização" : "outro";
    }

    case PortugolLexer.FECHA_PARENTESES: {
      const bloco = BLOCO_DO_COMANDO.get(tokens[últimoParêntese - 1]?.type ?? -1);

      if (bloco) {
        return bloco;
      }

      return éListaDeParâmetros(tokens, últimoParêntese) ? "função" : "outro";
    }

    default: {
      return "outro";
    }
  }
}

/**
 * O `(` na posição dada é o de `funcao nome(` ou `funcao tipo nome(`.
 */
export function éListaDeParâmetros(tokens: Token[], parêntese: number) {
  const nome = tokens[parêntese - 1];
  const antes = tokens[parêntese - 2];

  return (
    nome?.type === PortugolLexer.ID &&
    (antes?.type === PortugolLexer.FUNCAO ||
      (antes?.type === PortugolLexer.TIPO && tokens[parêntese - 3]?.type === PortugolLexer.FUNCAO))
  );
}

function éCabeçalhoDoPara(tokens: Token[], parêntese: number) {
  return tokens[parêntese - 1]?.type === PortugolLexer.PARA;
}

/**
 * Se a inicialização do `para` é uma declaração, antes do primeiro `;`.
 */
function declaraNoPara(tokens: Token[], parêntese: number) {
  const depois = tokens.slice(parêntese + 1);

  return depois[0]?.type === PortugolLexer.TIPO && depois.every(token => token.type !== PortugolLexer.PONTOVIRGULA);
}

/**
 * Se o cursor está onde começa um comando: depois de `{`, `}`, `senao`, do `)` de um `se`, ou
 * numa linha nova depois de um valor completo.
 */
function começaComando(tokens: Token[], linhaDoCursor: number, últimoParêntese: number) {
  const anterior = tokens.at(-1);

  if (!anterior || ANTES_DE_COMANDO.has(anterior.type)) {
    return true;
  }

  const comando = tokens[últimoParêntese - 1];

  if (comando && anterior.type === PortugolLexer.FECHA_PARENTESES && BLOCO_DO_COMANDO.has(comando.type)) {
    return true;
  }

  return linhaFinal(anterior) < linhaDoCursor && FIM_DE_VALOR.has(anterior.type);
}
