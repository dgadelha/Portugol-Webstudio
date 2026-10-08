import { type ArquivoContext, PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import type { PortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import {
  type ATNSimulator,
  BaseErrorListener,
  CharStream,
  CommonToken,
  CommonTokenStream,
  Lexer,
  Parser,
  type ParserRuleContext,
  type RecognitionException,
  type Recognizer,
  Token,
} from "antlr4ng";

import {
  erroCadeiaIncompleta,
  erroChaveDeVetorMatrizMalPosicionada,
  erroComandoEsperado,
  erroEscopo,
  erroExpressãoEsperada,
  erroExpressãoIncompleta,
  erroExpressãoForaEscopoFunção,
  erroExpressãoInesperada,
  erroExpressõesForaEscopoPrograma,
  erroFaltaDoisPontos,
  erroInteiroForaDoIntervalo,
  erroNomeSímboloEstáFaltando,
  erroPalavraReservadaEstáFaltando,
  erroParaEsperaCondição,
  erroParâmetrosNãoTipados,
  erroParêntese,
  erroParsingNãoTratado,
  erroRealComVírgula,
  erroRetornoVetorMatriz,
  erroSenãoInesperado,
  erroSímboloFaltandoOuRealComVírgula,
  erroTipoDeDadoEstáFaltando,
  erroTokenFaltando,
} from "../diagnosticos/index.js";

const MAIOR_INTEIRO = 2_147_483_647n;

/**
 * Um destes no lugar onde o parser travou é uma expressão sem o operando da direita.
 */
const OPERADORES_BINÁRIOS = new Set([
  "+",
  "-",
  "*",
  "/",
  "%",
  "==",
  "!=",
  "<",
  "<=",
  ">",
  ">=",
  "e",
  "ou",
  "&",
  "|",
  "^",
  "<<",
  ">>",
]);

/**
 * O nome da regra em que o parser estava e os dois acima dela: é por eles que o Portugol
 * Studio decide qual erro mostrar.
 */
interface Contextos {
  atual: string;
  pai: string;
  avô: string;
}

export interface ResultadoSintaxe {
  árvore: ArquivoContext;
  erros: PortugolCodeDiagnostic[];
}

/**
 * Porta de `analise/sintatica/AnalisadorSintatico.java` e do seu
 * `TradutorMismatchedTokenException`, que traduzem o erro do ANTLR para uma mensagem a partir
 * da regra da gramática em que ele aconteceu. As duas gramáticas são a mesma, então os nomes
 * de regra e de token batem.
 *
 * Como no Java, só o primeiro erro é reportado: o Portugol Studio interrompe a análise nele,
 * e o que o ANTLR acha depois de se recuperar costuma ser consequência do primeiro.
 *
 * Divergências deliberadas:
 * - o erro marca o token onde o código quebrou, e não a posição 1:1 (código fora do programa)
 *   nem o fim do arquivo (marca o último token antes dele, que fica numa linha visível);
 * - o caractere não reconhecido aparece entre aspas simples, e não duplas (`''@''`), e a cadeia
 *   sem fim vira `ErroCadeiaIncompleta`, e não o resto do arquivo como expressão inesperada;
 * - erro do léxico também interrompe a análise: no Java a análise semântica roda sobre o que
 *   sobrou, e o segundo erro dela é sempre consequência do primeiro;
 * - código depois do programa é procurado nos tokens, e não por contagem de chaves no texto,
 *   que se confundia com chaves dentro de cadeias e com comentários de linha;
 * - onde a mensagem do Java aponta o problema errado (mandar inserir `(` quando falta uma
 *   expressão, por exemplo), a tradução foi corrigida; cada caso está marcado com
 *   "Divergência" no código.
 */
class AnalisadorSintático extends BaseErrorListener {
  private readonly erros: PortugolCodeDiagnostic[] = [];
  private erroNoParser = false;

  constructor(private readonly código: string) {
    super();
  }

  analisar(): ResultadoSintaxe {
    const lexer = new PortugolLexer(CharStream.fromString(this.código));
    const tokens = new CommonTokenStream(lexer);
    const parser = new PortugolParser(tokens);

    lexer.removeErrorListeners();
    lexer.addErrorListener(this);
    parser.removeErrorListeners();
    parser.addErrorListener(this);

    const árvore = parser.arquivo();

    tokens.fill();

    // A ordem é a do Java: o léxico reclama quando o parser pede o token, então um caractere
    // inválido logo adiante sai antes do erro do parser que ele causou.
    let erro: PortugolCodeDiagnostic | undefined = this.erros[0];
    const inteiro = this.inteiroForaDoIntervalo(tokens);

    // O inteiro grande também é erro do léxico no Java; aqui ele só é achado no fim, então
    // vale a posição.
    if (inteiro && (!erro || this.vemAntes(inteiro, erro))) {
      erro = inteiro;
    }

    erro ??= this.códigoApósPrograma(tokens, árvore);

    return { árvore, erros: erro ? [erro] : [] };
  }

  override syntaxError<T extends ATNSimulator>(
    recognizer: Recognizer<T>,
    _offendingSymbol: Token | null,
    line: number,
    column: number,
    msg: string,
    e: RecognitionException | null,
  ) {
    if (recognizer instanceof Lexer) {
      this.erros.push(this.traduzirErroLéxico(line, column, msg));
    } else if (recognizer instanceof Parser && !this.erroNoParser) {
      this.erroNoParser = true;
      this.erros.push(this.traduzirErroParsing(recognizer, msg, e));
    }
  }

  /**
   * O léxico só reclama de um caractere que não começa nenhum token. Uma aspa sem par é o
   * caso comum: o ANTLR desiste da cadeia e reclama dela até o fim do arquivo.
   */
  private traduzirErroLéxico(linha: number, coluna: number, msg: string) {
    const texto = this.desfazerExibição(msg.replace(/^token recognition error at: /, ""));
    const token = CommonToken.fromType(Token.INVALID_TYPE, texto.split("\n", 1)[0]);

    token.line = linha;
    token.column = coluna;

    return texto.startsWith('"') ? erroCadeiaIncompleta(token) : erroExpressãoInesperada(token, texto);
  }

  private traduzirErroParsing(parser: Parser, msg: string, e: RecognitionException | null): PortugolCodeDiagnostic {
    const token = parser.getCurrentToken();
    const texto = token.type === Token.EOF ? "<EOF>" : (token.text ?? "");
    const ctx = parser.context!;
    const contextos = this.contextosDe(parser, ctx);
    const { atual, pai, avô } = contextos;
    const esperados = parser.getExpectedTokens().toArray();
    const nomesEsperados = esperados.map(
      tipo => parser.vocabulary.getSymbolicName(tipo) ?? parser.vocabulary.getLiteralName(tipo) ?? "",
    );

    // No fim do arquivo não há o que sublinhar: marca o último token antes dele.
    const alvo = token.type === Token.EOF ? (parser.tokenStream.LT(-1) ?? token) : token;

    // O Java só tem uma exceção "causa" quando o ANTLR lançou uma; para token sobrando ou
    // faltando ele monta a própria exceção, sem causa.
    const causa = e?.ctx ? { token: e.offendingToken?.text ?? "", contexto: parser.ruleNames[e.ctx.ruleIndex] } : null;

    if (causa?.contexto === "comando" && causa.token === ",") {
      return erroSímboloFaltandoOuRealComVírgula(alvo, atual);
    }

    if (/^\d*$/.test(texto) && /^\d*,\d*$/.test(this.textoAntesDe(ctx))) {
      return erroSímboloFaltandoOuRealComVírgula(alvo, atual);
    }

    // Divergência: o Java só reconhece o `senao` solto quando o token sobra; nos outros
    // caminhos ele vira "o nome da função não foi informado".
    if (texto === "senao") {
      return erroSenãoInesperado(alvo);
    }

    // Divergência: comando direto no programa, fora de função. O Java tem a mensagem
    // (`ErroExpressaoForaEscopoFuncao`), mas o trecho que a usava está comentado e o erro sai
    // como "o escopo do programa não foi fechado".
    if (atual === "arquivo" && !["<EOF>", "funcao", "}"].includes(texto) && !nomesEsperados.includes("PROGRAMA")) {
      return erroExpressãoForaEscopoFunção(alvo, texto);
    }

    // `reportUnwantedToken`: o token sobra, e removê-lo resolveria.
    if (msg.startsWith("extraneous input")) {
      if ((texto === "<EOF>" || texto === "funcao") && nomesEsperados.includes("FECHA_CHAVES")) {
        return erroEscopo(alvo, atual);
      }

      if (atual === "expressao" && pai === "declaracaoVariavel") {
        return erroExpressãoEsperada(alvo, pai, avô);
      }

      if (texto === ";" && this.contém(contextos, "para")) {
        return erroParaEsperaCondição(alvo);
      }

      if (atual === "parametroFuncao" && nomesEsperados.includes("FECHA_PARENTESES")) {
        return erroParâmetrosNãoTipados(alvo);
      }

      if (texto === "," && /^.*retorne\d*$/.test(ctx.getText())) {
        return erroRealComVírgula(alvo);
      }

      return erroExpressãoInesperada(alvo, texto);
    }

    if (atual === "parametroFuncao") {
      return erroParâmetrosNãoTipados(alvo);
    }

    if (atual === "expressao") {
      if (["se", "enquanto", "facaEnquanto"].includes(pai)) {
        return erroExpressãoEsperada(alvo, pai, avô);
      }

      if (pai === "expressao") {
        return erroExpressãoIncompleta(alvo);
      }

      if (texto === ",") {
        return erroRealComVírgula(alvo);
      }

      if (msg.includes("<EOF>")) {
        return erroCadeiaIncompleta(alvo);
      }
    }

    if (this.contém(contextos, "para")) {
      let contextosPara = contextos;

      if (causa && e?.ctx) {
        contextosPara = this.contextosDe(parser, e.ctx);

        if (texto === "," && causa.contexto === "expressao") {
          return erroRealComVírgula(alvo);
        }
      }

      return this.traduzirErroPara(parser, alvo, ctx, esperados, contextosPara);
    }

    // Função, variável ou parâmetro sem nome.
    if (atual === "parametro" || atual.startsWith("declaracao")) {
      if (texto === "[") {
        return atual === "declaracaoFuncao" ? erroRetornoVetorMatriz(alvo) : erroChaveDeVetorMatrizMalPosicionada(alvo);
      }

      if (nomesEsperados.includes("ID")) {
        // Divergência: o Java diz só que o nome não foi informado, mas a pessoa escreveu um.
        const reservada = parser.vocabulary.getLiteralName(token.type) === `'${texto}'` && /^\p{L}+$/u.test(texto);

        return erroNomeSímboloEstáFaltando(alvo, atual, reservada ? texto : undefined);
      }
    }

    if (atual === "listaComandos") {
      return erroComandoEsperado(alvo);
    }

    if (atual === "listaExpressoes") {
      return erroExpressãoEsperada(alvo, pai, avô);
    }

    // Divergência: onde cabe uma expressão, o `(` é só um dos tokens esperados, e o Java, que
    // pega o primeiro da lista que sabe explicar, mandava inserir um `(` em `inteiro x =`.
    if (nomesEsperados.includes("ABRE_PARENTESES") && nomesEsperados.includes("ID")) {
      if (OPERADORES_BINÁRIOS.has(texto)) {
        return erroExpressãoIncompleta(alvo);
      }

      return atual === "expressao" ? erroExpressãoEsperada(alvo, pai, avô) : erroExpressãoEsperada(alvo, atual, pai);
    }

    for (const [i, nome] of nomesEsperados.entries()) {
      const traduzido = this.traduzirTokenEsperado(parser, alvo, atual, nome, esperados[i]);

      if (traduzido) {
        return traduzido;
      }
    }

    return erroParsingNãoTratado(
      alvo,
      this.exibir(e?.offendingToken ?? token),
      parser.getExpectedTokens().toStringWithVocabulary(parser.vocabulary),
    );
  }

  /**
   * O primeiro token esperado que o Java sabe explicar decide o erro.
   */
  private traduzirTokenEsperado(
    parser: Parser,
    alvo: Token,
    atual: string,
    nome: string,
    tipo: number,
  ): PortugolCodeDiagnostic | undefined {
    switch (nome) {
      case "TIPO": {
        return erroTipoDeDadoEstáFaltando(alvo);
      }

      case "FECHA_CHAVES": {
        return erroEscopo(alvo, atual);
      }

      case "ABRE_PARENTESES": {
        return erroParêntese(alvo, "abertura");
      }

      case "FECHA_PARENTESES": {
        return erroParêntese(alvo, "fechamento");
      }

      case "DOISPONTOS": {
        return erroFaltaDoisPontos(alvo);
      }

      case "PONTOVIRGULA": {
        return erroTokenFaltando(alvo, nome, this.símboloDe(parser, tipo));
      }

      case "ENQUANTO": {
        return erroPalavraReservadaEstáFaltando(alvo, "enquanto");
      }

      case "PROGRAMA": {
        const início = this.código.indexOf("programa");

        return erroExpressõesForaEscopoPrograma(alvo, this.código.slice(0, Math.max(início - 1, 0)), "antes");
      }

      default: {
        return undefined;
      }
    }
  }

  private traduzirErroPara(
    parser: Parser,
    alvo: Token,
    ctx: ParserRuleContext,
    esperados: number[],
    contextos: Contextos,
  ): PortugolCodeDiagnostic {
    const nomes = esperados.map(tipo => parser.vocabulary.getSymbolicName(tipo) ?? "");

    if (contextos.atual === "para" && nomes.length > 0 && nomes[0] !== "PONTOVIRGULA") {
      if (nomes.includes("ABRE_PARENTESES")) {
        return erroParêntese(alvo, "abertura");
      }

      if (nomes.includes("FECHA_PARENTESES")) {
        return erroParêntese(alvo, "fechamento");
      }
    }

    if (ctx.getText().split(";").length - 1 === 1 && esperados.length > 0) {
      return erroTokenFaltando(alvo, nomes[0], this.símboloDe(parser, esperados[0]));
    }

    return erroParaEsperaCondição(alvo);
  }

  /**
   * `ErroInteiroForaDoIntervalo`: no Java o `Integer.parseInt` da ação do léxico estoura; o
   * nosso léxico aceita qualquer tamanho.
   */
  private inteiroForaDoIntervalo(tokens: CommonTokenStream) {
    const grande = tokens
      .getTokens()
      .find(token => token.type === PortugolLexer.INT && BigInt(token.text ?? "0") > MAIOR_INTEIRO);

    return grande && erroInteiroForaDoIntervalo(grande, grande.text ?? "");
  }

  /**
   * A regra `arquivo` não termina em `EOF`, então o parser para no `}` do programa e ignora
   * o que vier depois.
   */
  private códigoApósPrograma(tokens: CommonTokenStream, árvore: ArquivoContext) {
    const fim = árvore.stop;

    if (!fim) {
      return;
    }

    const sobra = tokens
      .getTokens()
      .find(
        token =>
          token.tokenIndex > fim.tokenIndex && token.channel === Token.DEFAULT_CHANNEL && token.type !== Token.EOF,
      );

    return sobra && erroExpressõesForaEscopoPrograma(sobra, this.código.slice(fim.stop + 1).trim(), "depois");
  }

  private contextosDe(parser: Parser, ctx: ParserRuleContext): Contextos {
    const nome = (c: ParserRuleContext | null | undefined) => (c ? parser.ruleNames[c.ruleIndex] : "");

    return { atual: nome(ctx), pai: nome(ctx.parent), avô: nome(ctx.parent?.parent) };
  }

  private vemAntes(a: PortugolCodeDiagnostic, b: PortugolCodeDiagnostic) {
    return a.startLine < b.startLine || (a.startLine === b.startLine && a.startCol < b.startCol);
  }

  private contém({ atual, pai, avô }: Contextos, regra: string) {
    return [atual, pai, avô].includes(regra);
  }

  /**
   * Os dois caracteres antes da regra e o primeiro dela: o Java procura ali um número real
   * escrito com vírgula, como `2,5`.
   */
  private textoAntesDe(ctx: ParserRuleContext) {
    const início = ctx.start?.start ?? -1;

    return início < 2 ? "" : this.código.slice(início - 2, início + 1);
  }

  /**
   * O símbolo do token (`;`) em vez do nome dele na gramática (`PONTOVIRGULA`).
   */
  private símboloDe(parser: Parser, tipo: number) {
    const literal = parser.vocabulary.getLiteralName(tipo);

    return literal ? literal.slice(1, -1) : (parser.vocabulary.getSymbolicName(tipo) ?? "").toLowerCase();
  }

  /**
   * O `getTokenErrorDisplay` do ANTLR.
   */
  private exibir(token: Token) {
    const texto = token.type === Token.EOF ? "<EOF>" : (token.text ?? `<${token.type}>`);

    return `'${texto
      .replaceAll("\n", String.raw`\n`)
      .replaceAll("\r", String.raw`\r`)
      .replaceAll("\t", String.raw`\t`)}'`;
  }

  /**
   * Desfaz o que o léxico do ANTLR faz com o texto ao montar a mensagem: aspas em volta e
   * quebras de linha escapadas.
   */
  private desfazerExibição(exibido: string) {
    return exibido
      .replace(/^'(.*)'$/s, "$1")
      .replaceAll(String.raw`\n`, "\n")
      .replaceAll(String.raw`\r`, "\r")
      .replaceAll(String.raw`\t`, "\t");
  }
}

export function analisarSintaxe(código: string): ResultadoSintaxe {
  return new AnalisadorSintático(código).analisar();
}
