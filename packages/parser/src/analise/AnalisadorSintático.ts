import { type ArquivoContext, PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import type { PortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import {
  type ATNSimulator,
  BailErrorStrategy,
  BaseErrorListener,
  CharStream,
  CommonToken,
  CommonTokenStream,
  Lexer,
  NoViableAltException,
  Parser,
  type ParserRuleContext,
  ParseCancellationException,
  PredictionMode,
  type RecognitionException,
  type Recognizer,
  Token,
} from "antlr4ng";

import {
  CÓDIGOS,
  erroCadeiaIncompleta,
  erroCaracterIncompleto,
  erroCaractereEmNome,
  erroChaveDeVetorMatrizMalPosicionada,
  erroComandoEsperado,
  erroComentárioSemFim,
  erroEscopo,
  erroExpressãoEsperada,
  erroExpressãoIncompleta,
  erroExpressãoForaEscopoFunção,
  erroExpressãoInesperada,
  erroExpressõesForaEscopoPrograma,
  erroFaltaNoFimDaLinha,
  erroFaltaDoisPontos,
  erroIgualEmComparação,
  erroInteiroForaDoIntervalo,
  erroNomeSímboloEstáFaltando,
  erroOperadorInexistente,
  erroPalavraReservadaEstáFaltando,
  erroPalavraForaDoLugar,
  erroParaEsperaCondição,
  erroParâmetrosNãoTipados,
  erroParêntese,
  erroParsingNãoTratado,
  erroRealComVírgula,
  erroRetornoVetorMatriz,
  erroSenãoComCondição,
  erroSenãoInesperado,
  erroSímboloFaltandoOuRealComVírgula,
  erroTipoDeDadoEstáFaltando,
  erroTokenFaltando,
  erroVírgulaEmColchetes,
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

const COMANDOS = new Set(["se", "enquanto", "para", "faca", "escolha", "retorne", "pare"]);

/**
 * O que, depois de um nome, faz dele uma chamada de função ou uma atribuição.
 */
const SEGUEM_COMANDO = new Set(["(", "[", "=", "+=", "-=", "*=", "/=", "%=", "++", "--"]);

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
 * - um comentário de bloco que não foi fechado é apontado como tal (no Java, o erro sai onde o parser
 *   tropeçou no texto do comentário), e um acento num nome ganha uma mensagem própria;
 * - onde a mensagem do Java aponta o problema errado (mandar inserir `(` quando falta uma
 *   expressão, por exemplo), a tradução foi corrigida; cada caso está marcado com
 *   "Divergência" no código.
 */
class AnalisadorSintático extends BaseErrorListener {
  private readonly erros: PortugolCodeDiagnostic[] = [];
  private erroNoParser = false;
  private readonly errosDoParser = new Set<PortugolCodeDiagnostic>();

  /**
   * As posições do ANTLR contam pontos de código, e não unidades de UTF-16 como as strings do
   * JavaScript: um emoji antes desloca qualquer `slice` feito direto no código.
   */
  private readonly pontos: string[];

  constructor(private readonly código: string) {
    super();
    this.pontos = Array.from(código);
  }

  analisar(): ResultadoSintaxe {
    const lexer = new PortugolLexer(CharStream.fromString(this.código));
    const tokens = new CommonTokenStream(lexer);

    lexer.removeErrorListeners();
    lexer.addErrorListener(this);

    const árvore = this.montarÁrvore(tokens);

    tokens.fill();

    // A ordem é a do Java: o léxico reclama quando o parser pede o token, então um caractere
    // inválido logo adiante sai antes do erro do parser que ele causou.
    let erro: PortugolCodeDiagnostic | undefined = this.erros[0];

    // Com todos os tokens lidos: o engano pode estar depois do token em que o parser travou,
    // como a vírgula de `inteiro m[2,3]`.
    if (erro && this.errosDoParser.has(erro)) {
      erro = this.enganoNaLinha(tokens, erro);
    }

    const inteiro = this.inteiroForaDoIntervalo(tokens);

    // O inteiro grande também é erro do léxico no Java; aqui ele só é achado no fim, então
    // vale a posição.
    if (inteiro && (!erro || this.vemAntes(inteiro, erro))) {
      erro = inteiro;
    }

    // O texto de um comentário sem fim vira código, e o parser tropeça nele em algum ponto
    // depois do `/*`: o comentário é a causa.
    const comentário = this.comentárioSemFim(tokens);

    if (comentário && (!erro || !this.vemAntes(erro, comentário))) {
      erro = comentário;
    }

    erro ??= this.códigoApósPrograma(tokens, árvore);

    return { árvore, erros: erro ? [erro] : [] };
  }

  /**
   * Em duas passadas, como recomenda o ANTLR: a predição SLL é centenas de vezes mais rápida
   * que a LL completa (12 ms contra 2,5 s num programa de 5000 linhas), mas desiste no primeiro
   * erro. Só então o código é analisado de novo na LL, que reporta o erro e se recupera dele.
   */
  private montarÁrvore(tokens: CommonTokenStream) {
    const rápido = new PortugolParser(tokens);

    rápido.removeErrorListeners();
    rápido.errorHandler = new BailErrorStrategy();
    rápido.interpreter.predictionMode = PredictionMode.SLL;

    try {
      return rápido.arquivo();
    } catch (error) {
      if (!(error instanceof ParseCancellationException)) {
        throw error;
      }
    }

    tokens.seek(0);

    const parser = new PortugolParser(tokens);

    parser.removeErrorListeners();
    parser.addErrorListener(this);

    return parser.arquivo();
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
      const traduzido = this.ondeTravou(recognizer, e, this.traduzirErroParsing(recognizer, msg, e));

      this.erros.push(this.comPalavraReservada(recognizer, this.noFimDaLinha(recognizer, traduzido)));
      this.errosDoParser.add(this.erros.at(-1)!);
    }
  }

  /**
   * O léxico só reclama de um caractere que não começa nenhum token. Uma aspa sem par é o
   * caso comum: o ANTLR desiste da cadeia e reclama dela até o fim do arquivo.
   */
  private traduzirErroLéxico(linha: number, coluna: number, msg: string) {
    const texto = this.desfazerExibição(msg.replace(/^token recognition error at: /, ""));
    const primeiraLinha = texto.split("\n", 1)[0];
    const token = CommonToken.fromType(Token.INVALID_TYPE, primeiraLinha);

    token.line = linha;
    token.column = coluna;

    if (texto.startsWith('"')) {
      return erroCadeiaIncompleta(token);
    }

    // Divergência: o Java mostra o resto da linha como "expressão inesperada", aspas incluídas.
    if (texto.startsWith("'")) {
      return erroCaracterIncompleto(token, primeiraLinha.startsWith("''"));
    }

    // Divergência: uma letra que o léxico não aceita só pode ser acentuada, e quase sempre
    // está num nome (`inteiro ação`). O Java diz só que "a expressão 'ç' não era esperada".
    if (/^\p{L}/u.test(primeiraLinha)) {
      return erroCaractereEmNome(token, Array.from(primeiraLinha)[0]);
    }

    return erroExpressãoInesperada(token, primeiraLinha);
  }

  /**
   * Divergência: numa "alternativa inviável", o token atual é onde a decisão do ANTLR começou
   * (o `(` de uma chamada, o `v` de um índice), e não onde ele travou. O Java decide e marca o
   * erro por esse começo, e `escreva(p b)` virava "a expressão '(' não era esperada". Quando a
   * tradução cai numa mensagem genérica, ela passa a falar do token onde o parser travou; as
   * mensagens específicas do Java, que dependem do começo da decisão, continuam as mesmas.
   */
  private ondeTravou(parser: Parser, e: RecognitionException | null, traduzido: PortugolCodeDiagnostic) {
    const genérica = [
      CÓDIGOS.EXPRESSAO_INESPERADA,
      CÓDIGOS.PARSING_NAO_TRATADO,
      `${CÓDIGOS.PARENTESIS}.1`,
      `${CÓDIGOS.EXPRESSAO_ESPERADA}.8`,
    ].includes(traduzido.code ?? "");

    // O `(` ou o `[` que a linha deixou aberto já diz o que falta, e no lugar certo.
    if (
      !genérica ||
      !(e instanceof NoViableAltException) ||
      !e.offendingToken ||
      e.offendingToken.tokenIndex <= parser.getCurrentToken().tokenIndex ||
      this.delimitadorSemFechar(parser, e)
    ) {
      return traduzido;
    }

    const travou = e.offendingToken;
    const anterior = this.tokenAnterior(parser, travou);

    // `para (inteiro i = v[0])`: a decisão do índice trava no `)` do cabeçalho. O que falta é a
    // condição de parada, como em `para (inteiro i = 0)`, que o parser percebe na regra `para`.
    if (this.fechaOCabeçalhoDoPara(parser, travou)) {
      return erroParaEsperaCondição(travou);
    }

    if (travou.type === Token.EOF) {
      return anterior && OPERADORES_BINÁRIOS.has(anterior.text ?? "")
        ? erroExpressãoIncompleta(anterior)
        : erroParsingNãoTratado(anterior ?? this.fimDoCódigo(travou));
    }

    // `escreva("a" + )`: o que falta é o operando depois do operador.
    if (anterior && OPERADORES_BINÁRIOS.has(anterior.text ?? "") && !OPERADORES_BINÁRIOS.has(travou.text ?? "")) {
      return erroExpressãoIncompleta(anterior);
    }

    const alvo = this.primeiraLinha(travou);

    return erroExpressãoInesperada(alvo, alvo.text ?? "");
  }

  /**
   * Na condição de um comando (`se`, `enquanto`, `faca-enquanto`, `para`) ou no valor de um
   * `escolha` ou `caso`, e não no corpo dele. No `para`, um `=` na inicialização é válido e
   * nem chega aqui.
   */
  private naCondição(contextos: Contextos) {
    const { atual, pai } = contextos;
    const noCorpo = atual === "listaComandos" || pai === "listaComandos" || atual === "comando";

    return (
      !noCorpo &&
      ["se", "enquanto", "facaEnquanto", "para", "condicao", "escolha", "caso"].some(regra =>
        this.contém(contextos, regra),
      )
    );
  }

  /**
   * Um token com o texto dado na posição de outro, para marcar mais de um token de uma vez.
   */
  private trechoDe(token: Token, texto: string) {
    const trecho = CommonToken.fromType(token.type, texto);

    trecho.line = token.line;
    trecho.column = token.column;

    return trecho;
  }

  /**
   * Logo depois de um `(`, `{` ou `,` vem um fechamento ou outra vírgula: falta mesmo o valor.
   */
  private lugarVazio(parser: Parser, token: Token) {
    const anterior = this.tokenAnterior(parser, token)?.text ?? "";

    return ["(", "{", ","].includes(anterior) && [")", "}", ",", ";"].includes(token.text ?? "");
  }

  /**
   * Dois valores lado a lado na mesma linha, como `a 1`: faltou um operador ou uma vírgula.
   */
  private valoresColados(parser: Parser, token: Token) {
    const anterior = this.tokenAnterior(parser, token);
    const valores = new Set<number>([
      PortugolLexer.ID,
      PortugolLexer.INT,
      PortugolLexer.HEXADECIMAL,
      PortugolLexer.REAL,
      PortugolLexer.STRING,
      PortugolLexer.CARACTER,
      PortugolLexer.LOGICO,
    ]);

    return (
      anterior !== undefined && anterior.line === token.line && valores.has(anterior.type) && valores.has(token.type)
    );
  }

  /**
   * Divergência: quando uma linha acaba sem fechar um `(`, `[` ou `{`, ou sem o nome que
   * faltava (`inclua biblioteca`, `inteiro a = 1,`), o ANTLR só percebe no primeiro token da
   * linha seguinte, e o Java marca o erro lá, às vezes com a mensagem desse token. Aqui o erro
   * vai para o fim da linha que ficou incompleta, dizendo o que falta.
   */
  private noFimDaLinha(parser: Parser, traduzido: PortugolCodeDiagnostic) {
    const token = parser.getCurrentToken();
    const anterior = this.tokenAnterior(parser, token);

    // Uma cadeia que engoliu uma quebra de linha termina depois da linha em que começa.
    const fimDoAnterior = (anterior?.line ?? 0) + (anterior?.text?.split("\n").length ?? 1) - 1;

    if (!anterior || token.type === Token.EOF || fimDoAnterior >= token.line || traduzido.startLine !== token.line) {
      return traduzido;
    }

    const aberto = this.abertoNaLinha(parser, anterior);

    if (aberto === "(") {
      return erroParêntese(anterior, "fechamento");
    }

    if (aberto === "[") {
      return erroFaltaNoFimDaLinha(anterior, "']'");
    }

    if (aberto === "{" || aberto === "{{") {
      return erroEscopo(anterior, aberto === "{{" ? "inicializacaoMatriz" : "inicializacaoArray");
    }

    const esperados = parser.getExpectedTokens();

    if (esperados.length === 1 && esperados.contains(PortugolLexer.ID)) {
      return erroFaltaNoFimDaLinha(anterior, anterior.text === "biblioteca" ? "o nome da biblioteca" : "um nome");
    }

    if (traduzido.code === CÓDIGOS.PALAVRA_RESERVADA_ESTA_FALTANDO) {
      return erroPalavraReservadaEstáFaltando(this.trechoDe(token, token.text ?? ""), "enquanto");
    }

    return traduzido;
  }

  /**
   * O `(`, `[` ou `{` que ficou aberto na linha do token, o mais interno. `{{` quando é a chave
   * de fora de uma matriz, que tem outras chaves dentro.
   */
  private abertoNaLinha(parser: Parser, último: Token) {
    let início = último.tokenIndex;

    while (início > 0 && parser.tokenStream.get(início - 1).line === último.line) {
      início--;
    }

    const pilha: Array<{ texto: string; matriz: boolean }> = [];
    let anterior = "";

    for (let i = início; i <= último.tokenIndex; i++) {
      const token = parser.tokenStream.get(i);

      if (token.channel !== Token.DEFAULT_CHANNEL) {
        continue;
      }

      const texto = token.text ?? "";

      // A chave que abre um bloco (`funcao inicio() {`, `se (x) {`) fica aberta no fim da linha
      // de propósito; só a de uma inicialização de vetor ou matriz pode ter sido esquecida.
      const inicialização = texto === "{" && ["=", "{", ","].includes(anterior);

      if (texto === "(" || texto === "[" || inicialização) {
        pilha.push({ texto, matriz: false });
      } else if ([")", "]", "}"].includes(texto)) {
        pilha.pop();

        const fora = pilha.at(-1);

        if (texto === "}" && fora?.texto === "{") {
          fora.matriz = true;
        }
      }

      anterior = texto;
    }

    const topo = pilha.at(-1);

    return topo?.matriz ? "{{" : topo?.texto;
  }

  /**
   * "A expressão 'caso' não era esperada" sai de vários caminhos; com uma palavra da linguagem,
   * a mensagem diz que é uma palavra, e onde ela pode ficar.
   */
  private comPalavraReservada(parser: Parser, traduzido: PortugolCodeDiagnostic) {
    const palavra = /^A expressão '(\p{L}+)' não era esperada/u.exec(traduzido.message)?.[1];

    if (!palavra || traduzido.code !== CÓDIGOS.EXPRESSAO_INESPERADA) {
      return traduzido;
    }

    const éPalavra = parser.vocabulary.getLiteralNames().includes(`'${palavra}'`);

    if (!éPalavra) {
      return traduzido;
    }

    const token = CommonToken.fromType(Token.INVALID_TYPE, palavra);

    token.line = traduzido.startLine;
    token.column = traduzido.startCol;

    return erroPalavraForaDoLugar(token, palavra);
  }

  /**
   * Divergência: enganos que o Java só aponta como "'{' não era esperada" ou pior, olhando a
   * linha inteira do erro.
   */
  private enganoNaLinha(tokens: CommonTokenStream, traduzido: PortugolCodeDiagnostic) {
    const parser = { tokenStream: tokens };
    const doErro = this.tokenNaPosição(tokens, traduzido.startLine, traduzido.startCol);

    if (!doErro) {
      return traduzido;
    }

    const início = this.começoDoComando(parser, doErro);
    const linha = this.tokensEntre(parser, início, this.fimDaLinha(parser, doErro));

    // `senao (condição) {`.
    const senão = linha.findIndex(token => token.text === "senao");

    if (senão !== -1 && linha[senão + 1]?.text === "(") {
      return erroSenãoComCondição(linha[senão]);
    }

    // `inteiro m[2,3]` ou `m[1,2]`.
    const vírgula = linha.findIndex((token, i) => token.text === "," && this.abertoAntes(linha, i) === "[");

    if (vírgula !== -1) {
      return erroVírgulaEmColchetes(linha[vírgula]);
    }

    // `se (v[1)`, `escreva(a }` e `inteiro v[3 = {1, 2, 3}`: um delimitador ficou aberto antes de outro
    // fechar, ou de um `=`.
    const semFechar = this.delimitadorAbertoAntes(linha);

    // No `para`, faltar a condição de parada vem antes: `para (inteiro i = 0 }`.
    if (semFechar && traduzido.code !== CÓDIGOS.PARA_ESPERA_CONDICAO) {
      return erroParsingNãoTratado(semFechar.token, `'${semFechar.esperado}'`, semFechar.token.text ?? "");
    }

    return traduzido;
  }

  /**
   * O primeiro token da linha que fecha o delimitador errado, ou um `=` dentro de colchetes, com o
   * fechamento que era esperado ali. Fechamentos de linhas anteriores ficam de fora.
   */
  private delimitadorAbertoAntes(linha: readonly Token[]) {
    const fechamentos = new Map([
      ["(", ")"],
      ["[", "]"],
      ["{", "}"],
    ]);
    const abertos: string[] = [];

    for (const token of linha) {
      const texto = token.text ?? "";
      const esperado = abertos.at(-1);
      const fechamento = fechamentos.get(texto);

      if (fechamento) {
        abertos.push(fechamento);
      } else if (esperado && [")", "]", "}"].includes(texto)) {
        if (texto !== esperado) {
          return { token, esperado };
        }

        abertos.pop();
      } else if (esperado === "]" && texto === "=") {
        return { token, esperado };
      }
    }

    return;
  }

  /**
   * O `(`, `[` ou `{` mais interno que está aberto antes do token, contando só a linha.
   */
  private abertoAntes(tokens: readonly Token[], até: number) {
    const abertos: string[] = [];

    for (const token of tokens.slice(0, até)) {
      const texto = token.text ?? "";

      if (["(", "[", "{"].includes(texto)) {
        abertos.push(texto);
      } else if ([")", "]", "}"].includes(texto)) {
        abertos.pop();
      }
    }

    return abertos.at(-1);
  }

  /**
   * O primeiro token do comando: o primeiro da linha, ou o que vem depois de um `}`, `{` ou `;`.
   */
  private começoDoComando(parser: Pick<Parser, "tokenStream">, token: Token) {
    let início = token;

    for (let anterior = this.tokenAnterior(parser, token); anterior; anterior = this.tokenAnterior(parser, anterior)) {
      if (anterior.line !== token.line || ["{", "}", ";"].includes(anterior.text ?? "")) {
        break;
      }

      início = anterior;
    }

    return início;
  }

  private tokensEntre(parser: Pick<Parser, "tokenStream">, início: Token, fim: Token) {
    const tokens: Token[] = [];

    for (let i = início.tokenIndex; i <= fim.tokenIndex; i++) {
      const token = parser.tokenStream.get(i);

      if (token.channel === Token.DEFAULT_CHANNEL) {
        tokens.push(token);
      }
    }

    return tokens;
  }

  private tokenSeguinte(parser: Pick<Parser, "tokenStream">, token: Token) {
    for (let i = token.tokenIndex + 1; i < (parser.tokenStream as CommonTokenStream).size; i++) {
      const seguinte = parser.tokenStream.get(i);

      if (seguinte.channel === Token.DEFAULT_CHANNEL) {
        return seguinte;
      }
    }

    return;
  }

  /**
   * O token que começa na posição do diagnóstico, entre os que o parser já leu.
   */
  private tokenNaPosição(tokens: CommonTokenStream, linha: number, coluna: number) {
    return tokens
      .getTokens()
      .find(token => token.line === linha && token.column === coluna && token.channel === Token.DEFAULT_CHANNEL);
  }

  /**
   * O último token da linha do token, para olhar o comando inteiro.
   */
  private fimDaLinha(parser: Pick<Parser, "tokenStream">, token: Token) {
    let fim = token;

    for (let seguinte = this.tokenSeguinte(parser, token); seguinte?.line === token.line;) {
      fim = seguinte;
      seguinte = this.tokenSeguinte(parser, seguinte);
    }

    return fim;
  }

  private éPalavraReservada(parser: Parser, token: Token) {
    const texto = token.text ?? "";

    return parser.vocabulary.getLiteralName(token.type) === `'${texto}'` && /^\p{L}+$/u.test(texto);
  }

  private palavraOuSobra(parser: Parser, token: Token, alvo: Token, texto: string) {
    return this.éPalavraReservada(parser, token)
      ? erroPalavraForaDoLugar(alvo, texto)
      : erroExpressãoInesperada(alvo, texto);
  }

  private tokenAnterior(parser: Pick<Parser, "tokenStream">, token: Token) {
    for (let i = token.tokenIndex - 1; i >= 0; i--) {
      const anterior = parser.tokenStream.get(i);

      if (anterior.channel === Token.DEFAULT_CHANNEL) {
        return anterior;
      }
    }

    return;
  }

  private traduzirErroParsing(parser: Parser, msg: string, e: RecognitionException | null): PortugolCodeDiagnostic {
    const token = parser.getCurrentToken();
    // Uma aspa sobrando transforma linhas inteiras numa cadeia: o erro é onde ela começa.
    const texto = token.type === Token.EOF ? "<EOF>" : (token.text ?? "").split("\n", 1)[0];
    const ctx = parser.context!;
    const contextos = this.contextosDe(parser, ctx);
    const { atual, pai, avô } = contextos;
    const esperados = parser.getExpectedTokens().toArray();
    const nomesEsperados = esperados.map(
      tipo => parser.vocabulary.getSymbolicName(tipo) ?? parser.vocabulary.getLiteralName(tipo) ?? "",
    );

    // No fim do arquivo não há o que sublinhar: marca o último token antes dele, ou, num
    // arquivo sem nenhum, o lugar onde o código acaba.
    const alvo = this.primeiraLinha(
      token.type === Token.EOF ? (parser.tokenStream.LT(-1) ?? this.fimDoCódigo(token)) : token,
    );

    // Só o primeiro token do arquivo pode esperar `programa`: o que vier antes dele está fora
    // do programa. Antes de tudo, porque o resto confundiria esse código com um comando.
    if (nomesEsperados.includes("PROGRAMA")) {
      return this.códigoAntesDoPrograma(token, alvo);
    }

    // O Java só tem uma exceção "causa" quando o ANTLR lançou uma; para token sobrando ou
    // faltando ele monta a própria exceção, sem causa.
    const causa = e?.ctx ? { token: e.offendingToken?.text ?? "", contexto: parser.ruleNames[e.ctx.ruleIndex] } : null;

    if (causa?.contexto === "comando" && causa.token === ",") {
      // Divergência: em `f(a +, 5)` a vírgula vem logo depois de um operador, e o que falta é
      // o operando; o Java fala de vírgula mal colocada e de nome não informado.
      const antesDaVírgula = e?.offendingToken ? this.tokenAnterior(parser, e.offendingToken) : undefined;

      if (antesDaVírgula && OPERADORES_BINÁRIOS.has(antesDaVírgula.text ?? "")) {
        return erroExpressãoIncompleta(antesDaVírgula);
      }

      return erroSímboloFaltandoOuRealComVírgula(alvo, atual);
    }

    if (/^\d*$/.test(texto) && /^\d*,\d*$/.test(this.textoAntesDe(ctx))) {
      return erroSímboloFaltandoOuRealComVírgula(alvo, atual);
    }

    // Divergência: um `=` onde cabia uma comparação, como `se (a = 1)`. O Java pede o `)`, o
    // `;` ou o `:` que viria depois da condição, o que não resolveria.
    if (texto === "=" && this.naCondição(contextos)) {
      const próximo = parser.tokenStream.LT(2);

      if ((próximo?.text === "<" || próximo?.text === ">") && próximo.start === token.stop + 1) {
        return erroOperadorInexistente(this.trechoDe(token, `=${próximo.text}`), `=${próximo.text}`);
      }

      return erroIgualEmComparação(alvo);
    }

    // Divergência: o real escrito com vírgula também numa condição e num caso, como em
    // `se (a > 2,5)`. Num índice, `m[1,2]` é mais provavelmente `m[1][2]`, e fica com o Java.
    if (
      texto === "," &&
      atual !== "tamanhoArray" &&
      !this.contém(contextos, "indiceArray") &&
      this.númeroComVírgula(parser, token)
    ) {
      return erroRealComVírgula(alvo);
    }

    // Divergência: o Java só reconhece o `senao` solto quando o token sobra; nos outros
    // caminhos ele vira "o nome da função não foi informado".
    if (texto === "senao") {
      return erroSenãoInesperado(alvo);
    }

    // Divergência: numa chamada que a linha deixou sem `)`, como `escreva(1` antes de um `}`,
    // o ANTLR só reclama no começo da decisão, e os tokens esperados são os de um comando
    // inteiro. O Java pedia um `(`; aqui, o `)` ou o `]` que falta.
    const semFechar = this.delimitadorSemFechar(parser, e);

    if (semFechar?.abertura === "(") {
      return erroParêntese(semFechar.último, "fechamento");
    }

    if (semFechar) {
      return semFechar.travou.type === Token.EOF
        ? erroParsingNãoTratado(semFechar.último, "']'", undefined)
        : erroFaltaNoFimDaLinha(semFechar.último, "']'");
    }

    // Divergência: comando direto no programa, fora de função. O Java tem a mensagem
    // (`ErroExpressaoForaEscopoFuncao`), mas o trecho que a usava está comentado e o erro sai
    // como "o escopo do programa não foi fechado".
    if (atual === "arquivo" && this.começaComando(parser, token)) {
      return erroExpressãoForaEscopoFunção(alvo, texto);
    }

    // `reportUnwantedToken`: o token sobra, e removê-lo resolveria.
    if (msg.startsWith("extraneous input")) {
      if ((texto === "<EOF>" || texto === "funcao") && nomesEsperados.includes("FECHA_CHAVES")) {
        return erroEscopo(alvo, atual === "listaComandos" ? pai : atual);
      }

      if (atual === "expressao" && pai === "declaracaoVariavel") {
        return erroExpressãoEsperada(alvo, pai, avô);
      }

      if (texto === ";" && this.noCabeçalhoDoPara(contextos)) {
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
      // Divergência: o Java diz que falta a condição para qualquer erro dentro dela, como em
      // `se (v[1)`; aqui, só quando ela está vazia.
      if (["se", "enquanto", "facaEnquanto"].includes(pai) && this.lugarVazio(parser, token)) {
        return erroExpressãoEsperada(alvo, pai, avô);
      }

      if (pai === "expressao") {
        return erroExpressãoIncompleta(alvo);
      }

      // Divergência: o Java fala de real com vírgula para qualquer vírgula aqui, mesmo sem
      // número, como em `inteiro x = (0, y = 1`.
      if (texto === "," && this.númeroComVírgula(parser, token)) {
        return erroRealComVírgula(alvo);
      }

      // Divergência: aqui o Java concluía "cadeia sem fim" sempre que o código acabava no meio
      // de uma expressão, como em `v[i` no fim do arquivo. A cadeia sem fim de verdade já é
      // apontada pelo léxico, então o caso segue para as outras regras.
    }

    if (this.noCabeçalhoDoPara(contextos)) {
      return this.traduzirErroPara(parser, alvo, ctx, esperados, contextos);
    }

    // Função, variável ou parâmetro sem nome.
    if (atual === "parametro" || atual.startsWith("declaracao")) {
      if (texto === "[") {
        return atual === "declaracaoFuncao" ? erroRetornoVetorMatriz(alvo) : erroChaveDeVetorMatrizMalPosicionada(alvo);
      }

      // Divergência: dentro do corpo de uma função, o nome dela já foi informado, e uma palavra
      // da linguagem ali (como `caso` ou `inclua`) é que está fora do lugar.
      if (atual === "declaracaoFuncao" && ctx.getToken(PortugolLexer.ABRE_CHAVES, 0)) {
        return this.palavraOuSobra(parser, token, alvo, texto);
      }

      // Divergência: em `inteiro m[2][` no fim do código, o nome está lá; falta fechar o `[`. O
      // Java diz que o nome não foi informado, porque o tamanho também pode começar por um nome.
      if (nomesEsperados.includes("FECHA_COLCHETES")) {
        const anterior = this.tokenAnterior(parser, token);

        return anterior && token.type === Token.EOF
          ? erroParsingNãoTratado(anterior, "']'", undefined)
          : erroParsingNãoTratado(alvo, "']'", texto);
      }

      if (nomesEsperados.includes("ID")) {
        // Divergência: o Java diz só que o nome não foi informado, mas a pessoa escreveu um.
        const reservada = parser.vocabulary.getLiteralName(token.type) === `'${texto}'` && /^\p{L}+$/u.test(texto);

        return erroNomeSímboloEstáFaltando(alvo, atual, reservada ? texto : undefined);
      }
    }

    if (atual === "listaComandos") {
      // Divergência: uma palavra da linguagem que não começa comando (como `caso`) não é a falta
      // de um comando, que é o que o Java diz.
      if (this.éPalavraReservada(parser, token)) {
        return this.palavraOuSobra(parser, token, alvo, texto);
      }

      return erroComandoEsperado(alvo);
    }

    // Divergência: o Java diz que o elemento não foi informado para qualquer erro dentro das
    // chaves, como em `{1, a || verdadeiro}`; aqui, só quando o lugar está vazio.
    if (atual === "listaExpressoes" && this.lugarVazio(parser, token)) {
      return erroExpressãoEsperada(alvo, pai, avô);
    }

    // Divergência: onde cabe uma expressão, o `(` é só um dos tokens esperados, e o Java, que
    // pega o primeiro da lista que sabe explicar, mandava inserir um `(` em `inteiro x =`.
    if (nomesEsperados.includes("ABRE_PARENTESES") && nomesEsperados.includes("ID")) {
      if (OPERADORES_BINÁRIOS.has(texto)) {
        return erroExpressãoIncompleta(alvo);
      }

      // Onde cabe um comando (o `se` está entre os esperados), não falta expressão nenhuma: o
      // token sobra, como um `)` solto depois de `caso 1:`.
      if (nomesEsperados.includes("SE") && token.type !== Token.EOF) {
        return erroExpressãoInesperada(alvo, texto);
      }

      // A mensagem que cita o comando ("o se espera uma expressão") só quando falta mesmo a
      // expressão; com algo lá dentro, a genérica, que `ondeTravou` leva aonde o parser travou.
      if (!this.lugarVazio(parser, token)) {
        return erroExpressãoEsperada(alvo, "", "");
      }

      return atual === "expressao" ? erroExpressãoEsperada(alvo, pai, avô) : erroExpressãoEsperada(alvo, atual, pai);
    }

    for (const [i, nome] of nomesEsperados.entries()) {
      const traduzido = this.traduzirTokenEsperado(parser, alvo, contextos, nome, esperados[i]);

      if (traduzido) {
        return traduzido;
      }
    }

    return this.traduzirNãoTratado(parser, alvo, token, texto, esperados);
  }

  /**
   * Divergência: aqui o Java mostra a mensagem crua do ANTLR, em inglês e com os nomes dos
   * tokens na gramática ("mismatched input 'funcao' expecting '{'"). Quando só um token cabe,
   * ele é dito; senão, o token que sobra é apontado.
   */
  private traduzirNãoTratado(parser: Parser, alvo: Token, token: Token, texto: string, esperados: number[]) {
    const antesDe = token.type === Token.EOF ? undefined : texto;

    if (esperados.length === 1) {
      const [tipo] = esperados as [number];
      const literal = parser.vocabulary.getLiteralName(tipo)?.slice(1, -1);

      if (literal && /^\p{L}+$/u.test(literal)) {
        return erroPalavraReservadaEstáFaltando(alvo, literal);
      }

      if (literal) {
        return erroParsingNãoTratado(alvo, `'${literal}'`, antesDe);
      }

      if (tipo === PortugolLexer.ID) {
        return erroParsingNãoTratado(alvo, "um nome", antesDe);
      }
    }

    return antesDe === undefined ? erroParsingNãoTratado(alvo) : erroExpressãoInesperada(alvo, texto);
  }

  /**
   * O primeiro token esperado que o Java sabe explicar decide o erro.
   */
  private traduzirTokenEsperado(
    parser: Parser,
    alvo: Token,
    { atual, pai }: Contextos,
    nome: string,
    tipo: number,
  ): PortugolCodeDiagnostic | undefined {
    switch (nome) {
      case "TIPO": {
        return erroTipoDeDadoEstáFaltando(alvo);
      }

      case "FECHA_CHAVES": {
        // Divergência: em `{a 1, 2}` falta um operador ou uma vírgula entre os dois valores, e
        // não o `}` que o Java pede.
        if (this.valoresColados(parser, alvo)) {
          return erroExpressãoInesperada(alvo, alvo.text ?? "");
        }

        return erroEscopo(alvo, atual === "listaComandos" ? pai : atual);
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
        return erroTokenFaltando(alvo, this.símboloDe(parser, tipo));
      }

      case "ENQUANTO": {
        return erroPalavraReservadaEstáFaltando(alvo, "enquanto");
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
      return erroTokenFaltando(alvo, this.símboloDe(parser, esperados[0]));
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

    return sobra && erroExpressõesForaEscopoPrograma(sobra, this.trecho(fim.stop + 1).trim(), "depois");
  }

  private contextosDe(parser: Parser, ctx: ParserRuleContext): Contextos {
    const nome = (c: ParserRuleContext | null | undefined) => (c ? parser.ruleNames[c.ruleIndex] : "");

    return { atual: nome(ctx), pai: nome(ctx.parent), avô: nome(ctx.parent?.parent) };
  }

  /**
   * Um comando de controle, ou um nome seguido do que faz dele uma chamada ou uma atribuição.
   * Qualquer outra coisa solta no programa (como o `lol` em `inclua biblioteca Graficos lol`)
   * fica com a mensagem do Java, de expressão inesperada.
   */
  private começaComando(parser: Parser, token: Token) {
    if (COMANDOS.has(token.text ?? "")) {
      return true;
    }

    const próximo = parser.tokenStream.LT(2)?.text ?? "";

    return token.type === PortugolLexer.ID && SEGUEM_COMANDO.has(próximo);
  }

  private vemAntes(a: PortugolCodeDiagnostic, b: PortugolCodeDiagnostic) {
    return a.startLine < b.startLine || (a.startLine === b.startLine && a.startCol < b.startCol);
  }

  /**
   * Se o token é o `)` que fecha o cabeçalho do `para` em que o parser está.
   */
  private fechaOCabeçalhoDoPara(parser: Parser, token: Token) {
    let contexto: ParserRuleContext | null = parser.context;

    while (contexto && contexto.ruleIndex !== PortugolParser.RULE_para) {
      if (contexto.ruleIndex === PortugolParser.RULE_listaComandos) {
        return false;
      }

      contexto = contexto.parent;
    }

    if (!contexto?.start) {
      return false;
    }

    let abertos = 0;

    for (let i = contexto.start.tokenIndex + 1; i <= token.tokenIndex; i++) {
      const texto = parser.tokenStream.get(i).text;

      if (texto === "(") {
        abertos++;
      } else if (texto === ")" && --abertos === 0) {
        return i === token.tokenIndex;
      }
    }

    return false;
  }

  /**
   * Divergência: o Java usa os erros do `para` sempre que ele está entre as três regras mais
   * próximas, e aí um `p+` no corpo do laço virava "o comando para necessita de uma condição de
   * parada". Só o cabeçalho do `para` tem condição; o corpo é uma `listaComandos`.
   */
  private noCabeçalhoDoPara(contextos: Contextos) {
    return contextos.atual !== "listaComandos" && contextos.pai !== "listaComandos" && this.contém(contextos, "para");
  }

  /**
   * O `(` ou o `[` mais interno que a linha deixou aberto no trecho que o parser não conseguiu
   * decidir, e o último token antes da quebra. Só quando a linha acaba assim: em `escreva(1 2)`
   * o `(` também está aberto quando o parser trava, mas o que falta é um operador ou uma
   * vírgula.
   */
  private delimitadorSemFechar(parser: Parser, e: RecognitionException | null) {
    if (!(e instanceof NoViableAltException) || !e.startToken || !e.offendingToken) {
      return;
    }

    const abertos: string[] = [];
    let último: Token | undefined;

    for (let i = e.startToken.tokenIndex; i < e.offendingToken.tokenIndex; i++) {
      const token = parser.tokenStream.get(i);

      if (token.channel !== Token.DEFAULT_CHANNEL) {
        continue;
      }

      if (token.text === "(" || token.text === "[") {
        abertos.push(token.text);
      } else if (token.text === ")" || token.text === "]") {
        abertos.pop();
      }

      último = token;
    }

    const abertura = abertos.at(-1);
    const quebrouALinha = e.offendingToken.type === Token.EOF || e.offendingToken.line > (último?.line ?? 0);

    return quebrouALinha && abertura && último ? { abertura, último, travou: e.offendingToken } : undefined;
  }

  /**
   * O texto do token, ou `undefined` no fim do arquivo, que é como as mensagens dizem "no fim do
   * código".
   */
  private textoOuFim(token: Token) {
    return token.type === Token.EOF ? undefined : (token.text ?? "");
  }

  /**
   * Uma vírgula colada a dois números, como em `2,5`. Separados por espaço (`2, 5`), são dois
   * valores, e numa chamada a vírgula nem sobra.
   */
  private númeroComVírgula(parser: Parser, vírgula: Token) {
    // A vírgula é o token atual; o seguinte pode nem ter sido lido ainda, e o `LT` o lê.
    const antes = parser.tokenStream.LT(-1);
    const depois = parser.tokenStream.LT(2);

    return (
      antes?.type === PortugolLexer.INT &&
      depois?.type === PortugolLexer.INT &&
      antes.stop + 1 === vírgula.start &&
      vírgula.stop + 1 === depois.start
    );
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

    return início < 2 ? "" : this.trecho(início - 2, início + 1);
  }

  private trecho(início: number, fim?: number) {
    return this.pontos.slice(início, fim).join("");
  }

  /**
   * Divergência: o Java corta o texto até o primeiro "programa" que achar, mesmo dentro de um
   * comentário, e sem ele mostra um trecho vazio. Num arquivo vazio, ou só com comentários,
   * o que falta é o próprio `programa`.
   */
  private códigoAntesDoPrograma(token: Token, alvo: Token) {
    if (token.type === Token.EOF) {
      return erroPalavraReservadaEstáFaltando(alvo, "programa");
    }

    const resto = this.trecho(token.start);
    const programa = /\bprograma\b/.exec(resto);

    return erroExpressõesForaEscopoPrograma(alvo, resto.slice(0, programa?.index).trim(), "antes");
  }

  /**
   * O token, ou um que cobre só a primeira linha dele: um erro de sintaxe não marca as
   * linhas que uma cadeia mal fechada engoliu.
   */
  private primeiraLinha(token: Token) {
    const texto = token.text ?? "";

    if (!texto.includes("\n")) {
      return token;
    }

    const recortado = CommonToken.fromType(token.type, texto.split("\n", 1)[0]);

    recortado.line = token.line;
    recortado.column = token.column;

    return recortado;
  }

  /**
   * Um token sem largura onde o código acaba, para o erro não marcar o texto `<EOF>`.
   */
  private fimDoCódigo(eof: Token) {
    const token = CommonToken.fromType(Token.EOF, "");

    token.line = eof.line;
    token.column = eof.column;

    return token;
  }

  /**
   * O léxico não reconhece um comentário de bloco sem fechamento: sobram um `/` e um `*` colados,
   * que nenhum código válido tem (não existe `*` unário).
   */
  private comentárioSemFim(tokens: CommonTokenStream) {
    const visíveis = tokens.getTokens().filter(token => token.channel === Token.DEFAULT_CHANNEL);
    const barra = visíveis.find((token, i) => {
      const próximo = visíveis[i + 1];

      return token.text === "/" && próximo?.text === "*" && próximo.start === token.stop + 1;
    });

    return barra && erroComentárioSemFim(barra);
  }

  /**
   * O símbolo do token (`;`) em vez do nome dele na gramática (`PONTOVIRGULA`).
   */
  private símboloDe(parser: Parser, tipo: number) {
    const literal = parser.vocabulary.getLiteralName(tipo);

    return literal ? literal.slice(1, -1) : (parser.vocabulary.getSymbolicName(tipo) ?? "").toLowerCase();
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
