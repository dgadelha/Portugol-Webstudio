import {
  type ArquivoContext,
  CasoContext,
  DeclaracaoFuncaoContext,
  ListaComandosContext,
  ListaDeclaracoesContext,
  ParaContext,
  type ParametroContext,
  PortugolLexer,
  PortugolParser,
} from "@portugol-webstudio/antlr";
import {
  CharStream,
  CommonTokenStream,
  type ParserRuleContext,
  type ParseTree,
  PredictionMode,
  type TerminalNode,
  Token,
} from "antlr4ng";

import type { ClasseSímbolo } from "../analise/Símbolo.js";
import { SUFIXO_DA_DIMENSÃO, tipoNoCódigo } from "../analise/TipoDado.js";
import { obterBiblioteca } from "../bibliotecas/metadados.js";

export type Dimensão = "vetor" | "matriz";

export interface ParâmetroDeclarado {
  nome: string;
  tipo: string;
  dimensão?: Dimensão;
  referência: boolean;
}

/**
 * Um nome declarado no programa, com o trecho do código em que ele é visível. As posições
 * contam pontos de código desde o começo do código, como as do ANTLR.
 */
export interface SímboloDeclarado {
  nome: string;
  classe: ClasseSímbolo;
  /**
   * O tipo primitivo como se escreve no código; `vazio` numa função sem retorno.
   */
  tipo: string;
  dimensão?: Dimensão;
  constante: boolean;
  origem: "global" | "função" | "parâmetro" | "local";
  /**
   * Por referência (`&`), só nos parâmetros.
   */
  referência: boolean;
  parâmetros: ParâmetroDeclarado[];
  posição: number;
  início: number;
  fim: number;
}

export interface BibliotecaIncluída {
  nome: string;
  alias?: string;
  posição: number;
}

export interface SímbolosDoPrograma {
  bibliotecas: BibliotecaIncluída[];
  símbolos: SímboloDeclarado[];
}

/**
 * Lê o código inteiro com a predição SLL e a recuperação de erros do ANTLR. A árvore do
 * `analisarSintaxe` serviria, mas com erro de sintaxe (quase sempre, durante a digitação) ele
 * analisa o código de novo na predição LL, para achar a mensagem certa: 200 ms no maior
 * exemplo, contra 8 ms aqui. Para saber o que foi declarado, a árvore remendada da SLL basta.
 */
function lerÁrvore(código: string) {
  const lexer = new PortugolLexer(CharStream.fromString(código));

  lexer.removeErrorListeners();

  const tokens = new CommonTokenStream(lexer);
  const parser = new PortugolParser(tokens);

  parser.removeErrorListeners();
  parser.interpreter.predictionMode = PredictionMode.SLL;

  const árvore = parser.arquivo();

  tokens.fill();

  return { árvore, tokens };
}

/**
 * A completação e a ajuda de assinatura pedem os símbolos do mesmo código, uma logo depois da
 * outra.
 */
let último: { código: string; símbolos: SímbolosDoPrograma } | undefined;

export function coletarSímbolos(código: string): SímbolosDoPrograma {
  if (último?.código !== código) {
    último = { código, símbolos: new Coletor(código).coletar() };
  }

  return último.símbolos;
}

/**
 * A biblioteca incluída com esse nome ou apelido, como o analisador aceita depois do ponto.
 */
export function bibliotecaIncluída(programa: SímbolosDoPrograma, nomeOuApelido: string) {
  const incluída = programa.bibliotecas.find(b => b.nome === nomeOuApelido || b.alias === nomeOuApelido);

  return incluída && obterBiblioteca(incluída.nome);
}

/**
 * Os símbolos visíveis na posição: uma declaração mais interna esconde a de fora com o mesmo
 * nome, como na `Memória` do analisador.
 */
export function símbolosVisíveis(programa: SímbolosDoPrograma, deslocamento: number): SímboloDeclarado[] {
  const visíveis = new Map<string, SímboloDeclarado>();

  for (const símbolo of programa.símbolos) {
    if (deslocamento < símbolo.início || deslocamento > símbolo.fim) {
      continue;
    }

    const outro = visíveis.get(símbolo.nome);

    if (!outro || maisInterno(símbolo, outro)) {
      visíveis.set(símbolo.nome, símbolo);
    }
  }

  return Array.from(visíveis.values());
}

const PRIORIDADE = { local: 3, parâmetro: 2, global: 1, função: 0 } as const;

function maisInterno(a: SímboloDeclarado, b: SímboloDeclarado) {
  if (PRIORIDADE[a.origem] !== PRIORIDADE[b.origem]) {
    return PRIORIDADE[a.origem] > PRIORIDADE[b.origem];
  }

  return a.início > b.início;
}

/**
 * Um token que o ANTLR inventou para seguir em frente (`<missing ID>`) não está no código.
 */
function real(nó: TerminalNode | null | undefined): nó is TerminalNode {
  return nó !== null && nó !== undefined && nó.symbol.tokenIndex >= 0;
}

class Coletor {
  private readonly árvore: ArquivoContext;
  private readonly tokens: CommonTokenStream;
  private readonly símbolos: SímboloDeclarado[] = [];

  constructor(código: string) {
    const lido = lerÁrvore(código);

    this.árvore = lido.árvore;
    this.tokens = lido.tokens;
  }

  coletar(): SímbolosDoPrograma {
    const bibliotecas: BibliotecaIncluída[] = [];

    for (const inclusão of this.árvore.inclusaoBiblioteca()) {
      const [nome, alias] = inclusão.ID();

      if (real(nome)) {
        bibliotecas.push({
          nome: nome.getText(),
          alias: real(alias) ? alias.getText() : undefined,
          posição: nome.symbol.start,
        });
      }
    }

    for (const lista of this.árvore.listaDeclaracoes()) {
      this.declarar(lista, "global", 0, Infinity);
    }

    for (const função of this.árvore.declaracaoFuncao()) {
      this.declararFunção(função);
    }

    return { bibliotecas, símbolos: this.símbolos };
  }

  private declararFunção(função: DeclaracaoFuncaoContext) {
    const nome = função.ID();

    if (!real(nome)) {
      return;
    }

    const lista = função.parametroFuncao()?.listaParametros();
    const parâmetros = (lista?.parametro() ?? []).filter(p => real(p.TIPO()) && real(p.ID()));
    const declarados = parâmetros.map(p => this.parâmetro(p));
    const fim = this.fimDoEscopo(função);

    this.símbolos.push({
      nome: nome.getText(),
      classe: "função",
      tipo: real(função.TIPO()) ? função.TIPO()!.getText() : "vazio",
      constante: false,
      origem: "função",
      referência: false,
      parâmetros: declarados,
      posição: nome.symbol.start,
      início: 0,
      fim: Infinity,
    });

    const início = função.parametroFuncao()?.start?.start ?? nome.symbol.start;

    for (const [i, { nome, tipo, dimensão, referência }] of declarados.entries()) {
      this.símbolos.push({
        nome,
        classe: dimensão ?? "variável",
        tipo,
        dimensão,
        constante: false,
        origem: "parâmetro",
        referência,
        parâmetros: [],
        posição: parâmetros[i].ID().symbol.start,
        início,
        fim,
      });
    }

    for (const lista of listasDeDeclarações(função)) {
      const escopo = this.escopoDe(lista);

      this.declarar(lista, "local", escopo.início, escopo.fim);
    }
  }

  private parâmetro(parâmetro: ParametroContext): ParâmetroDeclarado {
    const dimensão = parâmetro.parametroMatriz() ? "matriz" : parâmetro.parametroArray() ? "vetor" : undefined;

    return {
      nome: parâmetro.ID().getText(),
      tipo: parâmetro.TIPO().getText(),
      dimensão,
      referência: real(parâmetro.E_COMERCIAL()),
    };
  }

  /**
   * Cada nome visível desde a própria declaração: `inteiro c = c + 1` enxerga o `c`, e o
   * analisador acusa que ele não foi inicializado.
   */
  private declarar(lista: ListaDeclaracoesContext, origem: "global" | "local", início: number, fim: number) {
    const tipo = lista.TIPO();

    if (!real(tipo)) {
      return;
    }

    for (const declaração of lista.declaracao()) {
      const nó = declaração.declaracaoVariavel() ?? declaração.declaracaoArray() ?? declaração.declaracaoMatriz();
      const nome = nó?.ID();

      if (!real(nome)) {
        continue;
      }

      const dimensão = declaração.declaracaoMatriz() ? "matriz" : declaração.declaracaoArray() ? "vetor" : undefined;

      this.símbolos.push({
        nome: nome.getText(),
        classe: dimensão ?? "variável",
        tipo: tipo.getText(),
        dimensão,
        constante: real(lista.CONSTANTE()),
        origem,
        referência: false,
        parâmetros: [],
        posição: nome.symbol.start,
        início: origem === "global" ? início : nome.symbol.start,
        fim,
      });
    }
  }

  /**
   * O bloco em que a declaração vale, como no analisador: a lista de comandos (com ou sem
   * chaves), o `para` inteiro para a variável do laço, o `caso`, o corpo da função.
   */
  private escopoDe(lista: ListaDeclaracoesContext) {
    for (let nó: ParserRuleContext | null = lista.parent; nó; nó = nó.parent) {
      if (nó instanceof ListaComandosContext || nó instanceof CasoContext || nó instanceof DeclaracaoFuncaoContext) {
        return { início: nó.start?.start ?? 0, fim: this.fimDoEscopo(nó) };
      }

      if (nó instanceof ParaContext) {
        const corpo: ListaComandosContext | null = nó.listaComandos();

        return { início: nó.start?.start ?? 0, fim: corpo ? this.fimDoEscopo(corpo) : this.depoisDe(nó) };
      }
    }

    return { início: 0, fim: Infinity };
  }

  /**
   * Onde o bloco fecha. Sem a `}`, o ANTLR para o bloco no último token que coube nele: o
   * escopo vai até o token seguinte, que é onde a pessoa provavelmente está escrevendo.
   */
  private fimDoEscopo(nó: ParserRuleContext) {
    const chave = nó.getToken(PortugolLexer.FECHA_CHAVES, 0);

    if (real(chave)) {
      return chave.symbol.start;
    }

    return this.depoisDe(nó);
  }

  private depoisDe(nó: ParserRuleContext) {
    const último = nó.stop;

    if (!último) {
      return Infinity;
    }

    for (let i = último.tokenIndex + 1; i < this.tokens.size; i++) {
      const token: Token = this.tokens.get(i);

      if (token.type === Token.EOF) {
        break;
      }

      if (token.channel === Token.DEFAULT_CHANNEL) {
        return token.start;
      }
    }

    return Infinity;
  }
}

/**
 * As declarações dentro do nó, sem montar a lista de todos os descendentes: o corpo da função
 * é percorrido a cada tecla.
 */
function* listasDeDeclarações(nó: ParseTree): Generator<ListaDeclaracoesContext> {
  for (let i = 0; i < nó.getChildCount(); i++) {
    const filho = nó.getChild(i)!;

    if (filho instanceof ListaDeclaracoesContext) {
      yield filho;
    }

    yield* listasDeDeclarações(filho);
  }
}

/**
 * Como a declaração se escreve: `inteiro idade`, `real notas[]`, `const inteiro MAX`,
 * `inteiro &total`.
 */
export function declaraçãoNoCódigo(símbolo: SímboloDeclarado) {
  return `${símbolo.constante ? "const " : ""}${parâmetroNoCódigo(símbolo)}`;
}

/**
 * O tipo como se escreve no código, com a dimensão e o `const`: `inteiro`, `real[]`,
 * `const inteiro`.
 */
export function tipoDoSímbolo(símbolo: SímboloDeclarado) {
  return `${símbolo.constante ? "const " : ""}${tipoNoCódigo(símbolo.tipo, símbolo.dimensão)}`;
}

export function parâmetroNoCódigo(parâmetro: ParâmetroDeclarado) {
  const sufixo = parâmetro.dimensão ? SUFIXO_DA_DIMENSÃO[parâmetro.dimensão] : "";

  return `${parâmetro.tipo} ${parâmetro.referência ? "&" : ""}${parâmetro.nome}${sufixo}`;
}
