import type { PortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import type { Token } from "antlr4ng";

import { obterBiblioteca, obterConstante, obterFunção, tipoDaBiblioteca } from "../bibliotecas/metadados.js";
import {
  bibliotecaImplementada,
  constanteImplementada,
  funçãoImplementada,
  funçãoReservadaImplementada,
} from "../bibliotecas/suporte.js";
import {
  avisoMatrizPodeSerVariável,
  avisoMatrizPodeSerVetor,
  avisoSímboloGlobalOcultado,
  avisoValorSeráConvertido,
  avisoVetorPodeSerVariável,
  type DimensãoDeclarada,
  erroAliasInexistente,
  erroAtribuirConstanteBiblioteca,
  erroAtribuirEmChamadaFunção,
  erroAtribuirEmConstante,
  erroAtribuirEmExpressão,
  erroAtribuirFunçãoBiblioteca,
  erroAtribuirMatrizVetorEmVariável,
  erroBibliotecaNãoInserida,
  erroBibliotecaNãoSuportada,
  erroBlocoInválido,
  erroConstanteNãoEncontradaNaBiblioteca,
  erroEscreverFunçãoSemRetorno,
  erroFunçãoInícioInexistente,
  erroFunçãoReservada,
  erroFunçãoReservadaNãoSuportada,
  erroFunçãoSemRetorne,
  erroInclusãoBiblioteca,
  erroInicializaçãoConstante,
  erroInicializaçãoErrada,
  erroNúmeroParâmetrosFunção,
  erroParaSemExpressãoAtribuição,
  erroParaSemExpressãoComparação,
  erroPareForaDeLaço,
  erroParâmetroExcedente,
  erroParâmetroRedeclarado,
  erroPassagemParâmetroInválida,
  erroQuantidadeElementosColunaMatriz,
  erroQuantidadeElementosVetor,
  erroQuantidadeLinhasMatriz,
  erroQuantificadorParâmetroFunção,
  erroReferênciaInválida,
  erroSímboloBibliotecaNãoSuportado,
  erroSímboloNãoDeclarado,
  erroSímboloNãoInicializado,
  erroSímboloRedeclarado,
  erroTamanhoMáximoMatriz,
  erroTamanhoMáximoVetor,
  erroTamanhoVetorMatriz,
  erroTipoDadoMatrizLiteral,
  erroTipoDadoVetorLiteral,
  erroTipoParâmetroIncompatível,
  erroTiposAtribuição,
  erroTiposCaso,
  erroTiposCondição,
  erroTiposDeslocamentoBits,
  erroTiposEscolha,
  erroTiposMenosUnário,
  erroTiposNegação,
  erroTiposNegaçãoBitwise,
  erroTiposOperaçãoBinária,
  erroTiposRetorne,
  erroTiposÍndiceMatriz,
  erroTiposÍndiceVetor,
  type FormaReferência,
  informaçãoSímboloNãoUtilizado,
  type OperadorBinário,
  type Origem,
  PARÂMETROS_ILIMITADOS,
  type QuantificadorParâmetro,
  TAMANHO_MÁXIMO,
  textoDe,
} from "../diagnosticos/index.js";
import {
  Arquivo,
  AtribuiçãoCmd,
  AtribuiçãoCompostaDivisãoCmd,
  AtribuiçãoCompostaMultiplicaçãoCmd,
  AtribuiçãoCompostaSomaCmd,
  AtribuiçãoCompostaSubtraçãoCmd,
  CadeiaExpr,
  CaractereExpr,
  CasoCmd,
  ChamadaFunçãoExpr,
  Comando,
  type Construtor,
  DeclaraçãoCmd,
  DecrementoUnárioPrefixadoExpr,
  DecrementoUnárioPósfixadoExpr,
  DivisãoExpr,
  EnquantoCmd,
  EscolhaCmd,
  Expressão,
  ExpressãoEntreParênteses,
  ExpressãoMatemática,
  ExpressãoUnária,
  FaçaEnquantoCmd,
  Função,
  InclusãoBiblioteca,
  IncrementoUnárioPrefixadoExpr,
  IncrementoUnárioPósfixadoExpr,
  InicializaçãoMatrizExpr,
  InicializaçãoVetorExpr,
  InteiroExpr,
  LógicoExpr,
  MaisUnárioExpr,
  MenosUnárioExpr,
  MultiplicaçãoExpr,
  MóduloExpr,
  NegaçãoBitwiseExpr,
  NegaçãoExpr,
  Node,
  OperaçãoAndBitwiseExpr,
  OperaçãoAndLógicoExpr,
  OperaçãoDiferençaExpr,
  OperaçãoIgualdadeExpr,
  OperaçãoMaiorOuIgualQueExpr,
  OperaçãoMaiorQueExpr,
  OperaçãoMenorOuIgualQueExpr,
  OperaçãoMenorQueExpr,
  OperaçãoOrBitwiseExpr,
  OperaçãoOrLógicoExpr,
  OperaçãoShiftLeftExpr,
  OperaçãoShiftRightExpr,
  OperaçãoXorExpr,
  ParaCmd,
  PareCmd,
  Parâmetro,
  RealExpr,
  ReferênciaArrayExpr,
  ReferênciaMatrizExpr,
  ReferênciaVarExpr,
  RetorneCmd,
  SeCmd,
  SomaExpr,
  SubtraçãoExpr,
} from "../nodes/index.js";
import { blocoVálido } from "./blocoVálido.js";
import { Memória } from "./Memória.js";
import { possuiRetornoObrigatório } from "./retornoObrigatório.js";
import { criarDado, criarFunção, type Símbolo, type SímboloFunção } from "./Símbolo.js";
import { consultarCompatibilidade, type Operação } from "./TabelaCompatibilidade.js";
import { avaliarTamanho, type ConstanteDeTamanho } from "./tamanhoVetorMatriz.js";
import { TIPO_TODOS, type TipoOperando, TipoPrimitivo } from "./TipoDado.js";

/**
 * Não podem ser declaradas nem usadas como nome de variável, e a chamada delas não passa
 * pela tabela de símbolos.
 */
export const FUNÇÕES_RESERVADAS: ReadonlySet<string> = new Set(["escreva", "leia", "limpa", "sorteia"]);

export interface OpçõesAnálise {
  /**
   * Liga os avisos de uso (variável declarada e não usada, só lida, só escrita), que são
   * específicos do Webstudio e têm severidade `Information`. Padrão: `true`.
   */
  avisosDeUso?: boolean;
}

type NóComTipo = AtribuiçãoCmd | Expressão;

const OPERADOR_DO_NÓ = new Map<Construtor, OperadorBinário>([
  [SomaExpr, "soma"],
  [SubtraçãoExpr, "subtração"],
  [MultiplicaçãoExpr, "multiplicação"],
  [DivisãoExpr, "divisão"],
  [MóduloExpr, "módulo"],
  [OperaçãoIgualdadeExpr, "igualdade"],
  [OperaçãoDiferençaExpr, "diferença"],
  [OperaçãoMaiorQueExpr, "maior"],
  [OperaçãoMaiorOuIgualQueExpr, "maiorIgual"],
  [OperaçãoMenorQueExpr, "menor"],
  [OperaçãoMenorOuIgualQueExpr, "menorIgual"],
  [OperaçãoAndLógicoExpr, "eLógico"],
  [OperaçãoOrLógicoExpr, "ouLógico"],
  [OperaçãoAndBitwiseExpr, "bitwiseE"],
  [OperaçãoOrBitwiseExpr, "bitwiseOu"],
  [OperaçãoXorExpr, "bitwiseXor"],
]);

const OPERADOR_COMPOSTO = new Map<Construtor, OperadorBinário>([
  [AtribuiçãoCompostaSomaCmd, "soma"],
  [AtribuiçãoCompostaSubtraçãoCmd, "subtração"],
  [AtribuiçãoCompostaMultiplicaçãoCmd, "multiplicação"],
  [AtribuiçãoCompostaDivisãoCmd, "divisão"],
]);

/**
 * O operador que cada incremento/decremento desdobra (`x++` é `x = x + 1`).
 */
const OPERADOR_UNÁRIO = new Map<Construtor, OperadorBinário>([
  [IncrementoUnárioPósfixadoExpr, "soma"],
  [IncrementoUnárioPrefixadoExpr, "soma"],
  [DecrementoUnárioPósfixadoExpr, "subtração"],
  [DecrementoUnárioPrefixadoExpr, "subtração"],
]);

const OPERAÇÃO_DO_OPERADOR: Readonly<Record<OperadorBinário, Operação>> = {
  soma: "soma",
  subtração: "divisaoMultiplicacaoSubtracao",
  multiplicação: "divisaoMultiplicacaoSubtracao",
  divisão: "divisaoMultiplicacaoSubtracao",
  módulo: "modulo",
  igualdade: "diferencaIgualdade",
  diferença: "diferencaIgualdade",
  maior: "maiorMenor",
  maiorIgual: "maiorMenor",
  menor: "maiorMenor",
  menorIgual: "maiorMenor",
  eLógico: "eOu",
  ouLógico: "eOu",
  bitwiseE: "bitwise",
  bitwiseOu: "bitwise",
  bitwiseXor: "bitwise",
};

/**
 * As classes que o Portugol Studio chama de `NoOperacaoLogica`.
 */
const OPERAÇÕES_LÓGICAS: ReadonlySet<Construtor> = new Set([
  OperaçãoIgualdadeExpr,
  OperaçãoDiferençaExpr,
  OperaçãoMaiorQueExpr,
  OperaçãoMaiorOuIgualQueExpr,
  OperaçãoMenorQueExpr,
  OperaçãoMenorOuIgualQueExpr,
  OperaçãoAndLógicoExpr,
  OperaçãoOrLógicoExpr,
]);

/**
 * `NoExpressaoLiteral`: o que uma constante aceita como inicialização.
 */
function éLiteral(nó: Node): boolean {
  return (
    nó instanceof InteiroExpr ||
    nó instanceof RealExpr ||
    nó instanceof CadeiaExpr ||
    nó instanceof CaractereExpr ||
    nó instanceof LógicoExpr
  );
}

/**
 * O curinga `todos` só aparece em assinaturas de biblioteca. Como tipo de expressão ele
 * vale "indeterminado", e todo consumidor pula a verificação.
 */
function comoPrimitivo(tipo: TipoOperando): TipoPrimitivo | undefined {
  return tipo === TIPO_TODOS ? undefined : tipo;
}

/**
 * Porta de `analise/semantica/AnalisadorSemantico.java`: uma travessia única sobre a nossa
 * árvore de nós.
 *
 * Na resolução de tipo, `undefined` significa "não foi possível determinar": todo consumidor
 * precisa pular a verificação, nunca emitir um segundo erro.
 */
export class AnalisadorSemântico {
  private readonly diagnósticos: PortugolCodeDiagnostic[] = [];
  private readonly memória = new Memória();

  /**
   * Bibliotecas incluídas, indexadas pelo nome real **e** pelo alias, como no Java.
   */
  private readonly bibliotecas = new Map<string, string>();

  private readonly tipoDadoEscolha: Array<TipoPrimitivo | undefined> = [];

  private funçãoAtual?: SímboloFunção;
  private declarandoArranjo = false;
  private passandoReferência = false;
  private passandoParâmetro = false;
  private profundidadeLaço = 0;
  private profundidadeEscolha = 0;

  /**
   * O lado esquerdo da atribuição sendo visitada: uma referência que é destino de atribuição
   * conta como escrita, não como leitura.
   */
  private alvoDeAtribuição?: Expressão;

  constructor(private readonly opções: OpçõesAnálise = {}) {}

  analisar(arquivo: Arquivo): PortugolCodeDiagnostic[] {
    // Espelha `ASA.getListaDeclaracoesGlobais(true)`: registrar tudo antes de visitar os
    // corpos é o que faz uma global declarada depois de uma função ser visível dentro dela.
    let temInício = false;

    for (const função of arquivo.funções) {
      if (função.nome === "inicio") {
        temInício = true;
      }

      this.registrarFunção(função);
    }

    if (!temInício) {
      this.registrar(erroFunçãoInícioInexistente(arquivo));
    }

    for (const biblioteca of arquivo.bibliotecas) {
      this.visitarInclusãoBiblioteca(biblioteca);
    }

    for (const declaração of arquivo.declarações) {
      this.visitarDeclaração(declaração);
    }

    for (const função of arquivo.funções) {
      this.visitarFunção(função);
    }

    // Os globais são conferidos no fim, quando já se sabe se alguma função os usou. Sem
    // desempilhar: a memória continua íntegra, e não é o fim da análise que a esvazia.
    this.relatarUso(this.memória.escopoGlobalAtual());

    return this.diagnósticos;
  }

  private registrar(diagnóstico: PortugolCodeDiagnostic) {
    this.diagnósticos.push(diagnóstico);
  }

  // -------------------------------------------------------------------------------------
  // Bibliotecas
  // -------------------------------------------------------------------------------------

  private visitarInclusãoBiblioteca(nó: InclusãoBiblioteca) {
    const biblioteca = obterBiblioteca(nó.nome);

    if (!biblioteca) {
      this.registrar(erroInclusãoBiblioteca(nó.nomeToken, { tipo: "inexistente", nome: nó.nome }));

      // Como no Java, uma biblioteca que não carrega não registra nem nome nem alias.
      return;
    }

    if (this.bibliotecas.has(nó.nome)) {
      this.registrar(erroInclusãoBiblioteca(nó.nomeToken, { tipo: "jáIncluída", nome: nó.nome }));
    } else {
      // Específico do Webstudio: a biblioteca existe no Portugol Studio, mas o nosso runtime
      // não tem código para ela. Avisar só na inclusão que vale dá um erro por programa —
      // nem um por uso, nem um por `inclua` repetido.
      if (!bibliotecaImplementada(nó.nome)) {
        this.registrar(erroBibliotecaNãoSuportada(nó.nomeToken, nó.nome));
      }

      this.bibliotecas.set(nó.nome, biblioteca.nome);
    }

    if (nó.alias === undefined) {
      return;
    }

    const existente = this.bibliotecas.get(nó.alias);

    if (existente) {
      this.registrar(
        erroInclusãoBiblioteca(nó.aliasToken ?? nó.nomeToken, {
          tipo: "aliasEmUso",
          alias: nó.alias,
          biblioteca: existente,
        }),
      );
    } else {
      this.bibliotecas.set(nó.alias, biblioteca.nome);
    }
  }

  // -------------------------------------------------------------------------------------
  // Funções
  // -------------------------------------------------------------------------------------

  private registrarFunção(nó: Função) {
    const símbolo = criarFunção(nó.nome, nó.retorno.primitivo, {
      nomeToken: nó.nomeToken,
      parâmetros: nó.parâmetros,
    });

    if (FUNÇÕES_RESERVADAS.has(nó.nome)) {
      this.registrar(erroFunçãoReservada(nó.nomeToken, nó.nome));
      símbolo.redeclarado = true;
      this.memória.adicionarSímbolo(símbolo);

      return;
    }

    const existente = this.memória.obterSímbolo(nó.nome);

    if (existente) {
      this.registrar(erroSímboloRedeclarado(nó.nomeToken, nó.nome, existente));
      símbolo.redeclarado = true;

      return;
    }

    this.memória.adicionarSímbolo(símbolo);
  }

  private visitarFunção(nó: Função) {
    // Deliberado: numa redeclaração o Java resolve o nome e cai na assinatura da primeira
    // homônima — o corpo da segunda é conferido contra o retorno da primeira. Verificado no
    // oracle (`funcao inteiro f()` + `funcao cadeia f()` acusa retorno "inteiro" nas duas).
    const símbolo = this.memória.obterSímbolo(nó.nome);

    if (símbolo?.classe !== "função") {
      // O nome foi tomado por uma variável global. O Portugol Studio estoura
      // `ClassCastException` aqui; nós apenas não analisamos o corpo.
      return;
    }

    const anterior = this.funçãoAtual;

    this.funçãoAtual = símbolo;
    this.memória.empilharFunção();

    for (const parâmetro of nó.parâmetros) {
      this.visitarParâmetro(parâmetro);
    }

    this.analisarListaBlocos(nó.instruções);

    if (símbolo.tipo !== TipoPrimitivo.VAZIO && !possuiRetornoObrigatório(nó.instruções)) {
      this.registrar(erroFunçãoSemRetorne(nó.nomeToken, nó.nome));
    }

    this.relatarUso(this.memória.desempilharFunção());
    this.funçãoAtual = anterior;
  }

  private visitarParâmetro(nó: Parâmetro) {
    const dimensão = nó.tipo.dimensão;
    const tipo = nó.tipo.primitivo;
    const símbolo = criarDado(dimensão ?? "variável", nó.nome, tipo, nó.nomeToken);

    // Parâmetros nascem inicializados: quem chama é obrigado a passar um valor.
    símbolo.inicializado = true;

    // A passagem do argumento já conta como escrita; um parâmetro que devolve valor conta
    // também como leitura. Vetor e matriz entram aí sem `&`: o Portugol passa por referência.
    símbolo.escritas = 1;
    símbolo.leituras = dimensão !== undefined || nó.referência ? 1 : 0;

    this.declararSímbolo(símbolo, nó.nomeToken, true);
  }

  // -------------------------------------------------------------------------------------
  // Declaração de símbolos
  // -------------------------------------------------------------------------------------

  /**
   * Porta da lógica de redeclaração × ocultação do Java
   * (`visitar(NoDeclaracaoVariavel|Vetor|Matriz|Parametro)`): o sub-escopo temporário existe
   * para comparar de que nível cada símbolo é visível — mesmo nível é redeclaração;
   * existente global e novo local é ocultação.
   */
  private declararSímbolo(símbolo: Símbolo, nomeToken: Token, éParâmetro = false) {
    const existente = this.memória.obterSímbolo(símbolo.nome);

    if (!existente) {
      if (FUNÇÕES_RESERVADAS.has(símbolo.nome)) {
        símbolo.redeclarado = true;
        this.registrar(erroSímboloRedeclarado(nomeToken, símbolo.nome, criarFunção(símbolo.nome, TipoPrimitivo.VAZIO)));

        return;
      }

      this.memória.adicionarSímbolo(símbolo);

      return;
    }

    const global = this.memória.éGlobal(existente);
    const local = this.memória.éLocal(existente);

    this.memória.empilharEscopo();
    this.memória.adicionarSímbolo(símbolo);

    const globalNovo = this.memória.éGlobal(símbolo);
    const localNovo = this.memória.éLocal(símbolo);

    if ((global && globalNovo) || (local && localNovo)) {
      símbolo.redeclarado = true;
      this.registrar(
        éParâmetro
          ? erroParâmetroRedeclarado(nomeToken, símbolo.nome, this.funçãoAtual?.nome ?? "")
          : erroSímboloRedeclarado(nomeToken, símbolo.nome, existente),
      );
      this.memória.desempilharEscopo();

      return;
    }

    this.memória.desempilharEscopo();
    this.memória.adicionarSímbolo(símbolo);
    this.registrar(
      avisoSímboloGlobalOcultado(nomeToken, símbolo.nome, símbolo.classe, global ? existente.classe : símbolo.classe),
    );
  }

  private visitarDeclaração(nó: DeclaraçãoCmd) {
    switch (nó.tipo.dimensão) {
      case "vetor": {
        this.declararVetor(nó);
        break;
      }

      case "matriz": {
        this.declararMatriz(nó);
        break;
      }

      default: {
        this.declararVariável(nó);
        break;
      }
    }
  }

  private declararVariável(nó: DeclaraçãoCmd) {
    const símbolo = criarDado("variável", nó.nome, nó.tipo.primitivo, nó.nomeToken);

    this.declararSímbolo(símbolo, nó.nomeToken);

    if (nó.constante && !nó.expressão) {
      this.registrar(erroSímboloNãoInicializado(nó.nomeToken, símbolo));
    }

    if (nó.expressão) {
      // A gramática não aceita `inteiro x = {1, 2}` (`{` não é expressão): o
      // `ErroInicializacaoInvalida` do Portugol Studio é inalcançável, o caso já é sintático.
      if (nó.constante) {
        this.verificarInicializaçãoConstante(nó.expressão, nó.nome);
      }

      símbolo.escritas++;
      this.analisarInicialização(símbolo, nó.expressão);

      // O valor da constante inteira é o que permite `inteiro v[N]`.
      if (nó.constante && símbolo.tipo === TipoPrimitivo.INTEIRO) {
        const valor = avaliarTamanho(nó.expressão, referência => this.constanteDeTamanho(referência));

        if (valor.situação === "valor") {
          símbolo.valorInteiro = valor.valor;
        }
      }
    }

    // O Java só marca a constância no fim, para que a própria inicialização não caia em
    // `ErroAtribuirEmConstante`.
    símbolo.constante = nó.constante;
  }

  private declararVetor(nó: DeclaraçãoCmd) {
    const tipo = nó.tipo;
    const expressãoTamanho = tipo.dimensão === "vetor" ? tipo.tamanho : undefined;
    const símbolo = criarDado("vetor", nó.nome, tipo.primitivo, nó.nomeToken);
    const tamanho = this.obterTamanhoVetorMatriz(expressãoTamanho, nó.nome, "vetor");

    if (tamanho !== undefined) {
      if (tamanho > TAMANHO_MÁXIMO) {
        this.registrar(erroTamanhoMáximoVetor(nó.nomeToken, nó.nome, tamanho));
      }

      if (tamanho === 1) {
        this.registrar(avisoVetorPodeSerVariável(nó.nomeToken, nó.nome, tamanho));
      }
    }

    this.declararSímbolo(símbolo, nó.nomeToken);

    if (nó.constante && !nó.expressão) {
      this.registrar(erroSímboloNãoInicializado(nó.nomeToken, símbolo));
    }

    if (nó.expressão) {
      if (nó.expressão instanceof InicializaçãoVetorExpr) {
        this.verificarQuantidadeElementosVetor(nó.expressão, nó.nome, tamanho);

        if (tamanho !== undefined && nó.constante) {
          this.verificarInicializaçãoConstanteVetor(nó.expressão, nó.nome);
        }

        símbolo.escritas++;
        this.declarandoArranjo = true;
        this.analisarInicialização(símbolo, nó.expressão);
        this.declarandoArranjo = false;
      } else {
        // `inteiro v[2] = 5` não passa do sintático (o slot só aceita `inicializacaoArray`),
        // então o `ErroAoInicializarVetor` do Portugol Studio é inalcançável.
        símbolo.escritas++;
        this.resolverTipo(nó.expressão);
      }
    }

    símbolo.constante = nó.constante;
  }

  private declararMatriz(nó: DeclaraçãoCmd) {
    const tipo = nó.tipo;
    const dimensões = tipo.dimensão === "matriz" ? tipo : undefined;
    const símbolo = criarDado("matriz", nó.nome, tipo.primitivo, nó.nomeToken);
    const linhas = this.obterTamanhoVetorMatriz(dimensões?.linhas, nó.nome, "linhas");
    const colunas = this.obterTamanhoVetorMatriz(dimensões?.colunas, nó.nome, "colunas");

    if (linhas !== undefined && colunas !== undefined) {
      if (linhas * colunas > TAMANHO_MÁXIMO) {
        this.registrar(erroTamanhoMáximoMatriz(nó.nomeToken, nó.nome, linhas, colunas));
      }

      if (linhas === 1 && colunas === 1) {
        this.registrar(avisoMatrizPodeSerVariável(nó.nomeToken, nó.nome, linhas));
      } else if (linhas === 1 || colunas === 1) {
        this.registrar(avisoMatrizPodeSerVetor(nó.nomeToken, nó.nome, linhas, colunas));
      }
    }

    this.declararSímbolo(símbolo, nó.nomeToken);

    if (nó.constante && !nó.expressão) {
      this.registrar(erroSímboloNãoInicializado(nó.nomeToken, símbolo));
    }

    if (nó.expressão) {
      if (nó.expressão instanceof InicializaçãoMatrizExpr) {
        this.verificarDimensõesInicializaçãoMatriz(nó.expressão, nó.nome, linhas, colunas);

        if (linhas !== undefined && colunas !== undefined && nó.constante) {
          this.verificarInicializaçãoConstanteMatriz(nó.expressão, nó.nome);
        }

        símbolo.escritas++;
        this.declarandoArranjo = true;
        this.analisarInicialização(símbolo, nó.expressão);
        this.declarandoArranjo = false;
      } else {
        // Como no vetor, `inteiro m[2][2] = 5` é erro sintático: `ErroAoInicializarMatriz`
        // é inalcançável.
        símbolo.escritas++;
        this.resolverTipo(nó.expressão);
      }
    }

    símbolo.constante = nó.constante;
  }

  /**
   * Porta de `obterTamanhoVetorMatriz` do Java sobre o avaliador de `tamanhoVetorMatriz.ts`.
   * Só devolve o tamanho quando ele é constante e conhecido.
   */
  private obterTamanhoVetorMatriz(
    expressão: Expressão | undefined,
    nome: string,
    dimensão: DimensãoDeclarada,
  ): number | undefined {
    if (!expressão) {
      return undefined;
    }

    const tipo = this.resolverTipo(expressão);

    if (tipo === undefined) {
      // Indeterminado: algum erro já saiu na própria expressão.
      return undefined;
    }

    if (tipo !== TipoPrimitivo.INTEIRO) {
      this.registrar(erroTamanhoVetorMatriz(expressão, nome, dimensão));

      return undefined;
    }

    const resultado = avaliarTamanho(expressão, referência => this.constanteDeTamanho(referência));

    switch (resultado.situação) {
      case "valor": {
        if (resultado.valor <= 0) {
          this.registrar(erroTamanhoVetorMatriz(expressão, nome, dimensão));

          return undefined;
        }

        return resultado.valor;
      }

      case "inválido": {
        // O Java só cita o nome da variável culpada quando ela está dentro de uma
        // expressão; no topo, a mensagem é a genérica.
        const culpada = resultado.nó === expressão ? undefined : resultado.variável;

        this.registrar(erroTamanhoVetorMatriz(resultado.nó, nome, dimensão, culpada));

        return undefined;
      }

      default: {
        return undefined;
      }
    }
  }

  private constanteDeTamanho(nó: ReferênciaVarExpr): ConstanteDeTamanho {
    if (nó.escopoBiblioteca !== undefined) {
      const biblioteca = this.bibliotecas.get(nó.escopoBiblioteca);
      const constante = biblioteca ? obterConstante(biblioteca, nó.nome) : undefined;

      if (constante?.tipo.primitivo === TipoPrimitivo.INTEIRO && typeof constante.valor === "number") {
        return { situação: "valor", valor: constante.valor };
      }

      return { situação: "indeterminado" };
    }

    const símbolo = this.memória.obterSímbolo(nó.nome);

    if (!símbolo || símbolo.classe !== "variável") {
      // Símbolo inexistente ou usado de forma errada: `resolverTipo` já reportou.
      return { situação: "indeterminado" };
    }

    if (!símbolo.constante) {
      return { situação: "nãoConstante", nome: nó.nome };
    }

    return símbolo.valorInteiro === undefined
      ? { situação: "indeterminado" }
      : { situação: "valor", valor: símbolo.valorInteiro };
  }

  /**
   * Como no Java, os elementos só são conferidos quando o tamanho declarado é conhecido:
   * `const inteiro W[] = {A, B}` é aceito.
   */
  private verificarQuantidadeElementosVetor(
    inicialização: InicializaçãoVetorExpr,
    nome: string,
    tamanho: number | undefined,
  ) {
    const declarados = inicialização.valores.length;

    if (tamanho !== undefined && tamanho !== declarados) {
      this.registrar(erroQuantidadeElementosVetor(inicialização, nome, tamanho, declarados));
    }
  }

  private verificarDimensõesInicializaçãoMatriz(
    inicialização: InicializaçãoMatrizExpr,
    nome: string,
    linhas: number | undefined,
    colunas: number | undefined,
  ) {
    if (linhas !== undefined && linhas !== inicialização.linhas.length) {
      this.registrar(erroQuantidadeLinhasMatriz(inicialização, nome, linhas, inicialização.linhas.length));
    }

    if (colunas === undefined) {
      return;
    }

    for (const [índice, linha] of inicialização.linhas.entries()) {
      const declarados = linha instanceof InicializaçãoVetorExpr ? linha.valores.length : 1;

      if (colunas !== declarados) {
        this.registrar(erroQuantidadeElementosColunaMatriz(inicialização, nome, índice, colunas, declarados));
      }
    }
  }

  private verificarInicializaçãoConstante(expressão: Expressão, nome: string) {
    const alvo = expressão instanceof MenosUnárioExpr ? expressão.valor : expressão;

    if (!éLiteral(alvo)) {
      this.registrar(erroInicializaçãoConstante(expressão, nome));
    }
  }

  private verificarInicializaçãoConstanteVetor(inicialização: InicializaçãoVetorExpr, nome: string) {
    for (const [índice, valor] of inicialização.valores.entries()) {
      if (!éLiteral(valor)) {
        this.registrar(erroInicializaçãoConstante(valor, nome, { índice }));
      }
    }
  }

  private verificarInicializaçãoConstanteMatriz(inicialização: InicializaçãoMatrizExpr, nome: string) {
    for (const [linha, valores] of inicialização.linhas.entries()) {
      if (!(valores instanceof InicializaçãoVetorExpr)) {
        continue;
      }

      for (const [coluna, valor] of valores.valores.entries()) {
        if (!éLiteral(valor)) {
          this.registrar(erroInicializaçãoConstante(valor, nome, { linha, coluna }));
        }
      }
    }
  }

  /**
   * O Java monta um `NoOperacaoAtribuicao` sintético entre o símbolo recém-declarado e a
   * inicialização; aqui o efeito é o mesmo sem criar nó. O símbolo fica visível para a
   * expressão com o flag de inicialização antigo — é isso que faz `inteiro c = c + 1` acusar
   * erro.
   */
  private analisarInicialização(símbolo: Símbolo, expressão: Expressão) {
    const anterior = símbolo.inicializado;

    this.memória.empilharEscopo();
    this.memória.adicionarSímbolo(símbolo);

    símbolo.inicializado = anterior;

    const tipoDireito = this.resolverTipo(expressão);

    if (tipoDireito !== undefined) {
      this.aplicarAtribuição(expressão, símbolo.tipo, tipoDireito);
    }

    símbolo.inicializado = true;
    this.memória.desempilharEscopo();
  }

  // -------------------------------------------------------------------------------------
  // Listas de comandos
  // -------------------------------------------------------------------------------------

  private analisarListaBlocos(blocos: ReadonlyArray<Comando | Expressão>) {
    this.memória.empilharEscopo();

    for (const bloco of blocos) {
      if (!blocoVálido(bloco)) {
        this.registrar(this.diagnósticoBlocoInválido(bloco));
      }

      this.visitarBloco(bloco);
    }

    this.relatarUso(this.memória.desempilharEscopo());
  }

  /**
   * Avisos de uso, específicos do Webstudio e com severidade `Information`: símbolos do
   * escopo que não foram lidos, não foram escritos, ou nenhum dos dois.
   */
  private relatarUso(escopo: Map<string, Símbolo> | undefined) {
    if (!escopo || this.opções.avisosDeUso === false) {
      return;
    }

    for (const símbolo of escopo.values()) {
      // Função não tem "uso" a relatar, e um símbolo recusado por redeclaração já rendeu
      // um erro — um aviso sobre ele só faria barulho.
      if (símbolo.classe === "função" || símbolo.redeclarado || !símbolo.nomeToken) {
        continue;
      }

      if (símbolo.leituras > 0 && símbolo.escritas > 0) {
        continue;
      }

      // Uma constante sempre tem valor: "nunca lida" nela quer dizer que ela não serve para nada.
      const uso =
        símbolo.leituras === 0
          ? símbolo.escritas === 0 || símbolo.constante
            ? "nãoUtilizado"
            : "nuncaLido"
          : "nuncaEscrito";

      this.registrar(informaçãoSímboloNãoUtilizado(símbolo.nomeToken, símbolo, uso));
    }
  }

  private diagnósticoBlocoInválido(bloco: Comando | Expressão): PortugolCodeDiagnostic {
    const éLógico = bloco instanceof LógicoExpr || OPERAÇÕES_LÓGICAS.has(bloco.constructor as Construtor);

    if (!éLógico) {
      return erroBlocoInválido(bloco, { tipo: "expressão" });
    }

    const esquerda = bloco instanceof ExpressãoMatemática ? bloco.esquerda : undefined;
    const referência = this.formaEIdentificadorDaReferência(esquerda);

    return erroBlocoInválido(bloco, { tipo: "lógica", referênciaEsquerda: referência });
  }

  private formaEIdentificadorDaReferência(nó?: Expressão): { forma: FormaReferência; nome: string } | undefined {
    if (nó instanceof ReferênciaVarExpr) {
      return { forma: "variável", nome: nó.nome };
    }

    if (nó instanceof ReferênciaArrayExpr) {
      return { forma: "vetor", nome: nó.nome };
    }

    if (nó instanceof ReferênciaMatrizExpr) {
      return { forma: "matriz", nome: nó.nome };
    }

    return undefined;
  }

  private visitarBloco(bloco: Comando | Expressão) {
    if (bloco instanceof DeclaraçãoCmd) {
      this.visitarDeclaração(bloco);
    } else if (bloco instanceof SeCmd) {
      this.visitarSe(bloco);
    } else if (bloco instanceof EnquantoCmd) {
      this.visitarEnquanto(bloco);
    } else if (bloco instanceof FaçaEnquantoCmd) {
      this.visitarFaçaEnquanto(bloco);
    } else if (bloco instanceof ParaCmd) {
      this.visitarPara(bloco);
    } else if (bloco instanceof EscolhaCmd) {
      this.visitarEscolha(bloco);
    } else if (bloco instanceof RetorneCmd) {
      this.visitarRetorne(bloco);
    } else if (bloco instanceof PareCmd) {
      this.visitarPare(bloco);
    } else {
      this.resolverTipo(bloco);
    }
  }

  private verificarCondição(condição: Expressão, comando: "enquanto" | "faca-enquanto" | "para" | "se") {
    const tipo = this.resolverTipo(condição);

    if (tipo !== undefined && tipo !== TipoPrimitivo.LÓGICO) {
      this.registrar(erroTiposCondição(condição, comando, tipo));
    }
  }

  private visitarSe(nó: SeCmd) {
    this.verificarCondição(nó.condição, "se");
    this.analisarListaBlocos(nó.instruções);

    if (nó.senão) {
      // Os dois ramos são sub-escopos independentes: declarar o mesmo nome nos dois é ok.
      this.analisarListaBlocos(nó.senão.instruções);
    }
  }

  private visitarEnquanto(nó: EnquantoCmd) {
    this.verificarCondição(nó.condição, "enquanto");
    this.profundidadeLaço++;
    this.analisarListaBlocos(nó.instruções);
    this.profundidadeLaço--;
  }

  private visitarFaçaEnquanto(nó: FaçaEnquantoCmd) {
    this.profundidadeLaço++;
    this.analisarListaBlocos(nó.instruções);
    this.profundidadeLaço--;
    this.verificarCondição(nó.condição, "faca-enquanto");
  }

  private visitarPara(nó: ParaCmd) {
    // Um sub-escopo em volta de inicialização + condição + incremento + corpo: é por isso
    // que reusar o nome da variável do `para` depois dele não é redeclaração.
    this.memória.empilharEscopo();

    // `para (inteiro i = 0, j = 0; ...)` é aceito pela gramática e pelo Portugol Studio.
    for (const inicialização of nó.inicializações) {
      if (
        inicialização instanceof AtribuiçãoCmd ||
        inicialização instanceof DeclaraçãoCmd ||
        inicialização instanceof ReferênciaVarExpr
      ) {
        this.visitarBloco(inicialização);
      } else {
        this.registrar(erroInicializaçãoErrada(inicialização));
      }
    }

    if (nó.condição) {
      this.verificarCondição(nó.condição, "para");
    } else {
      this.registrar(erroParaSemExpressãoComparação(nó));
    }

    const incremento = nó.incremento;

    if (incremento) {
      // `i++` e `i += 1` valem: o Portugol Studio os transforma em atribuição.
      if (incremento instanceof AtribuiçãoCmd || incremento instanceof ExpressãoUnária) {
        this.visitarBloco(incremento);
      } else {
        this.registrar(erroParaSemExpressãoAtribuição(nó));
      }
    }

    this.profundidadeLaço++;
    this.analisarListaBlocos(nó.instruções);
    this.profundidadeLaço--;

    this.relatarUso(this.memória.desempilharEscopo());
  }

  private visitarEscolha(nó: EscolhaCmd) {
    const tipo = this.resolverTipo(nó.condição);

    this.tipoDadoEscolha.push(tipo);

    if (tipo !== undefined && tipo !== TipoPrimitivo.INTEIRO && tipo !== TipoPrimitivo.CARACTER) {
      this.registrar(erroTiposEscolha(nó.condição, tipo));
    }

    this.profundidadeEscolha++;

    for (const caso of nó.casos) {
      this.visitarCaso(caso);
    }

    this.profundidadeEscolha--;
    this.tipoDadoEscolha.pop();
  }

  private visitarCaso(nó: CasoCmd) {
    const escolha = this.tipoDadoEscolha.at(-1);

    if (!nó.contrário && nó.condição) {
      const tipo = this.resolverTipo(nó.condição);

      // Quando o tipo do `escolha` não pôde ser determinado, o Portugol Studio abandona o
      // comando inteiro; aqui só pulamos a checagem do `caso`.
      if (tipo !== undefined && escolha !== undefined) {
        if (escolha === TipoPrimitivo.INTEIRO || escolha === TipoPrimitivo.CARACTER) {
          if (tipo !== escolha) {
            this.registrar(erroTiposCaso(nó.condição, tipo, [escolha]));
          }
        } else if (tipo !== TipoPrimitivo.INTEIRO && tipo !== TipoPrimitivo.CARACTER) {
          this.registrar(erroTiposCaso(nó.condição, tipo, [TipoPrimitivo.INTEIRO, TipoPrimitivo.CARACTER]));
        }
      }
    }

    this.analisarListaBlocos(nó.instruções);
  }

  private visitarRetorne(nó: RetorneCmd) {
    const função = this.funçãoAtual;

    if (!nó.expressão) {
      if (função && função.tipo !== TipoPrimitivo.VAZIO) {
        this.registrar(erroTiposRetorne(nó, função.nome, função.tipo, TipoPrimitivo.VAZIO));
      }

      return;
    }

    const tipo = this.resolverTipo(nó.expressão);

    if (!função || tipo === undefined) {
      return;
    }

    const resultado = consultarCompatibilidade("retornoFuncao", função.tipo, tipo);

    if (resultado.situação === "incompatível") {
      this.registrar(erroTiposRetorne(nó, função.nome, função.tipo, tipo));
    } else if (resultado.situação === "conversão") {
      this.registrar(
        avisoValorSeráConvertido(nó, { tipo: "retorno", função: função.nome }, resultado.de, resultado.resultado),
      );
    }
  }

  private visitarPare(nó: PareCmd) {
    // Específico do Webstudio: no Portugol Studio isto é erro sintático. A nossa gramática
    // aceita `pare` solto e o transpilador gera um `break` cru — `SyntaxError` de JavaScript.
    if (this.profundidadeLaço === 0 && this.profundidadeEscolha === 0) {
      this.registrar(erroPareForaDeLaço(nó));
    }
  }

  // -------------------------------------------------------------------------------------
  // Atribuição
  // -------------------------------------------------------------------------------------

  private operadorComposto(cmd: AtribuiçãoCmd): OperadorBinário | undefined {
    return OPERADOR_COMPOSTO.get(cmd.constructor as Construtor);
  }

  private visitarAtribuição(cmd: AtribuiçãoCmd): TipoPrimitivo | undefined {
    const esquerda = cmd.esquerda;
    const direita = cmd.direita;

    if (!esquerda || !direita) {
      // Árvore incompleta por erro sintático.
      return undefined;
    }

    const operador = this.operadorComposto(cmd);
    const alvo = this.prepararAlvoAtribuição(cmd, esquerda, direita);

    // O lado esquerdo é destino, não leitura: sem isso nunca sairia o aviso "atribuída, mas
    // nunca é lida". Os índices de `v[i] = 1` continuam contando como leitura.
    const alvoAnterior = this.alvoDeAtribuição;

    this.alvoDeAtribuição = esquerda;

    const tipoEsquerdo = this.resolverTipo(esquerda);

    this.alvoDeAtribuição = alvoAnterior;

    if (alvo.símbolo) {
      alvo.símbolo.inicializado = alvo.inicializadoAnterior;
    }

    // `x op= e` é `x = x op e`: a segunda referência a `x` é avaliada com o flag de
    // inicialização antigo, e é ela que acusa "não inicializado".
    if (operador && alvo.símbolo?.classe === "variável" && !alvo.inicializadoAnterior) {
      this.registrar(erroSímboloNãoInicializado(alvo.token ?? esquerda, alvo.símbolo));
    }

    // `x op= e` também **lê** `x`: sem isto, uma variável só tocada por `x += 1` cairia no
    // aviso "atribuída, mas nunca é lida" — que `x++`, o mesmo desdobramento, não dá.
    if (operador && alvo.símbolo) {
      alvo.símbolo.leituras++;
    }

    const tipoDireito = this.resolverTipo(direita);
    let tipoValor = tipoDireito;

    if (operador) {
      tipoValor =
        tipoEsquerdo === undefined || tipoDireito === undefined
          ? undefined
          : this.aplicarBinária(cmd, operador, tipoEsquerdo, tipoDireito);
    }

    let resultado: TipoPrimitivo | undefined;

    if (tipoEsquerdo !== undefined && tipoValor !== undefined) {
      resultado = this.aplicarAtribuição(direita, tipoEsquerdo, tipoValor);
    }

    if (alvo.símbolo) {
      alvo.símbolo.inicializado = true;
    }

    return resultado;
  }

  /**
   * Devolve o símbolo alvo já marcado como inicializado: o Java marca antes de visitar o
   * operando esquerdo e restaura antes de visitar o direito.
   */
  private prepararAlvoAtribuição(
    cmd: Node,
    esquerda: Expressão,
    direita: Expressão,
  ): { inicializadoAnterior: boolean; símbolo?: Símbolo; token?: Token } {
    if (esquerda instanceof ReferênciaVarExpr) {
      if (esquerda.escopoBiblioteca !== undefined) {
        this.verificarAtribuiçãoEmBiblioteca(esquerda);

        return { inicializadoAnterior: false };
      }

      const símbolo = this.memória.obterSímbolo(esquerda.nome);
      const inicializadoAnterior = símbolo?.inicializado ?? false;

      if (símbolo) {
        símbolo.inicializado = true;
        símbolo.escritas++;
      }

      if (símbolo?.classe === "variável") {
        if (símbolo.constante) {
          this.registrar(erroAtribuirEmConstante(esquerda, símbolo));
        }

        if (direita instanceof InicializaçãoVetorExpr || direita instanceof InicializaçãoMatrizExpr) {
          this.registrar(erroAtribuirMatrizVetorEmVariável(direita));
        }
      }

      // `v = 5` com `v` vetor cai em `ErroReferenciaInvalida` na visita da referência: é por
      // isso que `ErroAoInicializarVetor`/`ErroAoInicializarMatriz` não são alcançáveis aqui.

      return { símbolo, inicializadoAnterior, token: esquerda.nomeToken };
    }

    if (esquerda instanceof ReferênciaArrayExpr || esquerda instanceof ReferênciaMatrizExpr) {
      const símbolo = this.memória.obterSímbolo(esquerda.nome);

      // O Java também emite `ErroSimboloNaoDeclarado` aqui, duplicando o erro que a visita
      // à própria referência já produz. Não reproduzimos a duplicata.
      //
      // Função também nasce `constante`, mas chamá-la de constante em `f[0] = 1` só
      // confundiria: o `ErroReferenciaInvalida` da visita já diz o que está errado.
      if (símbolo?.constante && símbolo.classe !== "função") {
        this.registrar(erroAtribuirEmConstante(cmd, símbolo));
      }

      if (símbolo) {
        símbolo.escritas++;
      }

      // `v[0] = {1, 2}` não passa do sintático (`{` não é expressão), então
      // `ErroAoAtribuirEmVetor`/`ErroAoAtribuirEmMatriz` são inalcançáveis.

      return { símbolo, inicializadoAnterior: símbolo?.inicializado ?? false, token: esquerda.nomeToken };
    }

    if (esquerda instanceof ChamadaFunçãoExpr) {
      this.registrar(erroAtribuirEmChamadaFunção(cmd));

      return { inicializadoAnterior: false };
    }

    this.registrar(erroAtribuirEmExpressão(cmd, éLiteral(esquerda) ? "literal" : "expressão"));

    return { inicializadoAnterior: false };
  }

  private aplicarAtribuição(
    origemDireita: Node,
    esquerdo: TipoPrimitivo,
    direito: TipoPrimitivo,
  ): TipoPrimitivo | undefined {
    const resultado = consultarCompatibilidade("atribuicao", esquerdo, direito);

    if (resultado.situação === "incompatível") {
      this.registrar(erroTiposAtribuição(origemDireita, esquerdo, direito));

      return undefined;
    }

    if (resultado.situação === "conversão") {
      // O Java escolhe a frase pela classe do operando direito: literais de vetor e de matriz
      // têm texto próprio.
      const literal =
        origemDireita instanceof InicializaçãoVetorExpr
          ? "vetor"
          : origemDireita instanceof InicializaçãoMatrizExpr
            ? "matriz"
            : undefined;

      this.registrar(
        avisoValorSeráConvertido(origemDireita, { tipo: "atribuição", literal }, resultado.de, resultado.resultado),
      );
    }

    return comoPrimitivo(resultado.resultado);
  }

  private aplicarBinária(
    origem: Node,
    operador: OperadorBinário,
    esquerdo: TipoPrimitivo,
    direito: TipoPrimitivo,
  ): TipoPrimitivo | undefined {
    const resultado = consultarCompatibilidade(OPERAÇÃO_DO_OPERADOR[operador], esquerdo, direito);

    if (resultado.situação === "incompatível") {
      this.registrar(erroTiposOperaçãoBinária(origem, operador, esquerdo, direito));

      return undefined;
    }

    // Nenhuma tabela de operação binária tem célula de conversão (só as de atribuição,
    // chamada de função e retorno têm), então aqui não há aviso a emitir.
    return comoPrimitivo(resultado.resultado);
  }

  // -------------------------------------------------------------------------------------
  // Resolução de tipo (o visitante de expressões)
  // -------------------------------------------------------------------------------------

  /**
   * Visitar é o que produz os diagnósticos das subexpressões: nenhum caminho pode deixar de
   * visitar, mesmo quando já se sabe que o tipo sairá indeterminado.
   */
  private resolverTipo(nó: NóComTipo | Comando): TipoPrimitivo | undefined {
    if (nó instanceof AtribuiçãoCmd) {
      return this.visitarAtribuição(nó);
    }

    if (nó instanceof InteiroExpr) {
      return TipoPrimitivo.INTEIRO;
    }

    if (nó instanceof RealExpr) {
      return TipoPrimitivo.REAL;
    }

    if (nó instanceof CadeiaExpr) {
      return TipoPrimitivo.CADEIA;
    }

    if (nó instanceof CaractereExpr) {
      return TipoPrimitivo.CARACTER;
    }

    if (nó instanceof LógicoExpr) {
      return TipoPrimitivo.LÓGICO;
    }

    if (nó instanceof ExpressãoEntreParênteses) {
      return this.resolverTipo(nó.expressão);
    }

    if (nó instanceof MaisUnárioExpr) {
      // O Portugol Studio não valida o `+` unário: `+"a"` não gera diagnóstico.
      return this.resolverTipo(nó.valor);
    }

    if (nó instanceof MenosUnárioExpr) {
      return this.resolverMenosUnário(nó);
    }

    if (nó instanceof NegaçãoExpr) {
      return this.resolverNegação(nó);
    }

    if (nó instanceof NegaçãoBitwiseExpr) {
      return this.resolverNegaçãoBitwise(nó);
    }

    if (nó instanceof ExpressãoUnária) {
      return this.resolverUnária(nó);
    }

    if (nó instanceof OperaçãoShiftLeftExpr || nó instanceof OperaçãoShiftRightExpr) {
      return this.resolverDeslocamento(nó);
    }

    if (nó instanceof ExpressãoMatemática) {
      return this.resolverBinária(nó);
    }

    if (nó instanceof ReferênciaVarExpr) {
      return this.resolverReferênciaVariável(nó);
    }

    if (nó instanceof ReferênciaArrayExpr) {
      return this.resolverReferênciaVetor(nó);
    }

    if (nó instanceof ReferênciaMatrizExpr) {
      return this.resolverReferênciaMatriz(nó);
    }

    if (nó instanceof ChamadaFunçãoExpr) {
      return this.visitarChamadaFunção(nó);
    }

    if (nó instanceof InicializaçãoVetorExpr) {
      return this.resolverLiteralVetor(nó);
    }

    if (nó instanceof InicializaçãoMatrizExpr) {
      return this.resolverLiteralMatriz(nó);
    }

    return undefined;
  }

  private resolverUnárioTipado(
    operando: NóComTipo,
    aceitos: readonly TipoPrimitivo[],
    erro: (tipo: TipoPrimitivo) => PortugolCodeDiagnostic,
  ): TipoPrimitivo | undefined {
    const tipo = this.resolverTipo(operando);

    if (tipo === undefined) {
      return undefined;
    }

    if (!aceitos.includes(tipo)) {
      this.registrar(erro(tipo));

      return undefined;
    }

    return tipo;
  }

  private resolverMenosUnário(nó: MenosUnárioExpr): TipoPrimitivo | undefined {
    return this.resolverUnárioTipado(nó.valor, [TipoPrimitivo.INTEIRO, TipoPrimitivo.REAL], tipo =>
      // O Portugol Studio reporta na posição do operando, não do `-`.
      erroTiposMenosUnário(nó.valor, nó, tipo),
    );
  }

  private resolverNegação(nó: NegaçãoExpr): TipoPrimitivo | undefined {
    return this.resolverUnárioTipado(nó.expressão, [TipoPrimitivo.LÓGICO], tipo => erroTiposNegação(nó, tipo));
  }

  private resolverNegaçãoBitwise(nó: NegaçãoBitwiseExpr): TipoPrimitivo | undefined {
    return this.resolverUnárioTipado(nó.expressão, [TipoPrimitivo.INTEIRO], tipo => erroTiposNegaçãoBitwise(nó, tipo));
  }

  private resolverBinária(nó: ExpressãoMatemática): TipoPrimitivo | undefined {
    const esquerdo = this.resolverTipo(nó.esquerda);
    const direito = this.resolverTipo(nó.direita);
    const operador = OPERADOR_DO_NÓ.get(nó.constructor as Construtor);

    if (esquerdo === undefined || direito === undefined || !operador) {
      return undefined;
    }

    return this.aplicarBinária(nó, operador, esquerdo, direito);
  }

  private resolverDeslocamento(nó: OperaçãoShiftLeftExpr | OperaçãoShiftRightExpr): TipoPrimitivo | undefined {
    const esquerdo = this.resolverTipo(nó.esquerda);
    const direito = this.resolverTipo(nó.direita);

    if (esquerdo === undefined || direito === undefined) {
      return undefined;
    }

    const resultado = consultarCompatibilidade("bitwise", esquerdo, direito);

    if (resultado.situação === "incompatível") {
      const operador = nó instanceof OperaçãoShiftLeftExpr ? "<<" : ">>";
      // O Portugol Studio reporta no operando culpado.
      const origem = esquerdo === TipoPrimitivo.INTEIRO ? nó.direita : nó.esquerda;

      this.registrar(erroTiposDeslocamentoBits(origem, operador, esquerdo, direito, textoDe(nó.esquerda)));

      return undefined;
    }

    return comoPrimitivo(resultado.resultado);
  }

  /**
   * Como o Java, a visita para no primeiro elemento de tipo divergente: os seguintes não são
   * analisados.
   */
  private resolverLiteralVetor(nó: InicializaçãoVetorExpr): TipoPrimitivo | undefined {
    // `{}` é aceito pela gramática; o Portugol Studio devolve tipo nulo e não reclama (o
    // `ErroVetorSemElementos` dele está comentado).
    if (nó.valores.length === 0) {
      return undefined;
    }

    return this.resolverElementosHomogêneos(nó.valores, () => erroTipoDadoVetorLiteral(nó));
  }

  /**
   * `{}` é erro sintático na nossa gramática (`inicializacaoMatriz` exige ao menos uma linha),
   * então `ErroInicializacaoMatrizEmBranco` só seria alcançável numa árvore truncada — e aí
   * preferimos ficar calados a inventar erro.
   */
  private resolverLiteralMatriz(nó: InicializaçãoMatrizExpr): TipoPrimitivo | undefined {
    const elementos = nó.linhas.flatMap(linha => (linha instanceof InicializaçãoVetorExpr ? linha.valores : [linha]));

    if (elementos.length === 0) {
      return undefined;
    }

    return this.resolverElementosHomogêneos(elementos, () => erroTipoDadoMatrizLiteral(nó));
  }

  private resolverElementosHomogêneos(
    elementos: readonly Expressão[],
    erroHeterogêneo: () => PortugolCodeDiagnostic,
  ): TipoPrimitivo | undefined {
    const primeiro = this.resolverTipo(elementos[0]);

    if (primeiro === undefined) {
      // Como o Java, tipo indeterminado no primeiro elemento aborta o literal inteiro: os
      // elementos seguintes não são analisados, e nenhum erro extra é inventado.
      return undefined;
    }

    for (const elemento of elementos.slice(1)) {
      const tipo = this.resolverTipo(elemento);

      if (tipo === undefined) {
        return undefined;
      }

      if (tipo !== primeiro) {
        this.registrar(erroHeterogêneo());

        return undefined;
      }
    }

    return primeiro;
  }

  // -------------------------------------------------------------------------------------
  // Referências
  // -------------------------------------------------------------------------------------

  private resolverReferênciaVariável(nó: ReferênciaVarExpr): TipoPrimitivo | undefined {
    if (nó.escopoBiblioteca !== undefined) {
      return this.resolverConstanteBiblioteca(nó.escopoBiblioteca, nó.nome, nó.nomeToken);
    }

    const símbolo = this.memória.obterSímbolo(nó.nome);

    if (!símbolo) {
      this.registrar(erroSímboloNãoDeclarado(nó.nomeToken, nó.nome, "variável"));

      return undefined;
    }

    this.contarUso(símbolo, nó);

    // Divergência: o Portugol Studio checa inicialização também para função, mas o construtor
    // de mensagem dele não tem ramo para função e produz um erro de texto vazio.
    if (símbolo.classe !== "função" && !símbolo.inicializado) {
      this.registrar(erroSímboloNãoInicializado(nó.nomeToken, símbolo));
    }

    if (
      símbolo.classe !== "variável" &&
      !this.declarandoArranjo &&
      !this.passandoReferência &&
      !this.passandoParâmetro
    ) {
      this.registrar(erroReferênciaInválida(nó, símbolo, "variável"));
    }

    // Divergência: o Portugol Studio devolve o tipo de retorno da função e isso cascateia
    // (`escreva(f)` acusaria também "função sem retorno"); aqui o erro acima é o único.
    return símbolo.classe === "função" ? undefined : símbolo.tipo;
  }

  /**
   * Índice indeterminado não vira erro: o Portugol Studio só compara o que conseguiu
   * resolver, e a matriz exige as duas pontas resolvidas para acusar.
   */
  private verificarÍndices(origem: Origem, tipos: ReadonlyArray<TipoPrimitivo | undefined>): void {
    const [linha, coluna] = tipos;

    if (tipos.length === 1) {
      if (linha !== undefined && linha !== TipoPrimitivo.INTEIRO) {
        this.registrar(erroTiposÍndiceVetor(origem, linha));
      }

      return;
    }

    if (linha === undefined || coluna === undefined) {
      return;
    }

    if (linha !== TipoPrimitivo.INTEIRO || coluna !== TipoPrimitivo.INTEIRO) {
      this.registrar(erroTiposÍndiceMatriz(origem, linha, coluna));
    }
  }

  private resolverReferênciaVetor(nó: ReferênciaArrayExpr): TipoPrimitivo | undefined {
    // O `índice` é obrigatório na gramática, mas some numa árvore truncada por erro sintático.
    const tipoÍndice = nó.índice?.índice ? this.resolverTipo(nó.índice.índice) : undefined;

    this.verificarÍndices(nó, [tipoÍndice]);

    if (nó.escopoBiblioteca !== undefined) {
      // Nenhuma constante de biblioteca é vetor, e o Portugol Studio não trata `g.CONST[0]`:
      // ele procura `CONST` na tabela de símbolos do programa e acusa "não declarado".
      this.registrar(erroSímboloNãoDeclarado(nó.nomeToken, nó.nome, "vetor"));

      return undefined;
    }

    const símbolo = this.memória.obterSímbolo(nó.nome);

    if (!símbolo) {
      this.registrar(erroSímboloNãoDeclarado(nó.nomeToken, nó.nome, "vetor"));

      return undefined;
    }

    this.contarUso(símbolo, nó);

    if (símbolo.classe !== "vetor") {
      this.registrar(erroReferênciaInválida(nó, símbolo, "vetor"));
    }

    return símbolo.tipo;
  }

  private resolverReferênciaMatriz(nó: ReferênciaMatrizExpr): TipoPrimitivo | undefined {
    const tipoLinha = nó.linha?.índice ? this.resolverTipo(nó.linha.índice) : undefined;
    // A gramática permite `a[i]` no ramo de matriz, então a coluna pode faltar.
    const tipoColuna = nó.coluna?.índice ? this.resolverTipo(nó.coluna.índice) : undefined;

    this.verificarÍndices(nó, [tipoLinha, tipoColuna]);

    if (nó.escopoBiblioteca !== undefined) {
      this.registrar(erroSímboloNãoDeclarado(nó.nomeToken, nó.nome, "matriz"));

      return undefined;
    }

    const símbolo = this.memória.obterSímbolo(nó.nome);

    if (!símbolo) {
      this.registrar(erroSímboloNãoDeclarado(nó.nomeToken, nó.nome, "matriz"));

      return undefined;
    }

    this.contarUso(símbolo, nó);

    if (símbolo.classe !== "matriz") {
      this.registrar(erroReferênciaInválida(nó, símbolo, "matriz"));
    }

    return símbolo.tipo;
  }

  private resolverConstanteBiblioteca(escopo: string, nome: string, origem: Token): TipoPrimitivo | undefined {
    const biblioteca = this.bibliotecas.get(escopo);

    if (!biblioteca) {
      this.registrar(erroBibliotecaNãoInserida(origem, escopo));

      return undefined;
    }

    const constante = obterConstante(biblioteca, nome);

    if (!constante) {
      // O Java cita aqui o nome real da biblioteca, e o alias na mensagem de função
      // inexistente. Mantemos a inconsistência dele para não divergir do texto.
      this.registrar(erroConstanteNãoEncontradaNaBiblioteca(origem, nome, biblioteca));

      return undefined;
    }

    // Só faz sentido reclamar da constante quando a biblioteca é suportada: se não for, a
    // inclusão já rendeu o erro.
    if (bibliotecaImplementada(biblioteca) && !constanteImplementada(biblioteca, nome)) {
      this.registrar(erroSímboloBibliotecaNãoSuportado(origem, biblioteca, nome, "constante"));
    }

    return comoPrimitivo(tipoDaBiblioteca(constante.tipo));
  }

  private verificarAtribuiçãoEmBiblioteca(esquerda: ReferênciaVarExpr) {
    const escopo = esquerda.escopoBiblioteca;

    if (escopo === undefined) {
      return;
    }

    const biblioteca = this.bibliotecas.get(escopo);

    if (!biblioteca) {
      this.registrar(erroAliasInexistente(esquerda.nomeToken, escopo));

      return;
    }

    this.registrar(
      obterConstante(biblioteca, esquerda.nome)
        ? erroAtribuirConstanteBiblioteca(esquerda.nomeToken, esquerda.nome, biblioteca)
        : erroAtribuirFunçãoBiblioteca(esquerda.nomeToken, biblioteca),
    );
  }

  private contarUso(símbolo: Símbolo, nó: Expressão) {
    if (nó === this.alvoDeAtribuição) {
      // A escrita já foi contada em `prepararAlvoAtribuição`.
      return;
    }

    símbolo.leituras++;

    // Quem é passado por referência pode voltar modificado — e vetor e matriz sempre são,
    // com ou sem `&`.
    if (this.passandoReferência || (this.passandoParâmetro && símbolo.classe !== "variável")) {
      símbolo.escritas++;
    }
  }

  /**
   * O Portugol Studio desdobra `x++`, `++x`, `x--`, `--x` (inclusive `x[i]++`) em
   * `x = x <op> 1` no sintático: por isso aqui vale o fluxo da atribuição.
   */
  private resolverUnária(nó: ExpressãoUnária<any>): TipoPrimitivo | undefined {
    const operador = OPERADOR_UNÁRIO.get(nó.constructor as Construtor);

    if (!operador) {
      return undefined;
    }

    const tiposÍndices = nó.índices.map(índice => (índice.índice ? this.resolverTipo(índice.índice) : undefined));
    const forma: FormaReferência = nó.índices.length === 0 ? "variável" : nó.índices.length === 1 ? "vetor" : "matriz";

    this.verificarÍndices(nó, tiposÍndices);

    const símbolo = this.memória.obterSímbolo(nó.nome);

    if (!símbolo) {
      this.registrar(erroSímboloNãoDeclarado(nó.nomeToken, nó.nome, forma));

      return undefined;
    }

    if (símbolo.classe !== forma) {
      this.registrar(erroReferênciaInválida(nó, símbolo, forma));
    }

    // Função também nasce `constante`, mas o Java só acusa constante de verdade: `f++` sai
    // com "usada como variável", "não inicializada" e o erro de tipo — nunca com este.
    if (símbolo.constante && símbolo.classe !== "função") {
      this.registrar(erroAtribuirEmConstante(nó, símbolo));
    }

    // O `x` do lado direito do desdobramento vê o flag de inicialização anterior.
    if (forma === "variável" && !símbolo.inicializado) {
      this.registrar(erroSímboloNãoInicializado(nó.nomeToken, símbolo));
    }

    símbolo.inicializado = true;

    // `x++` é `x = x + 1`: lê e escreve.
    símbolo.leituras++;
    símbolo.escritas++;

    const valor = this.aplicarBinária(nó, operador, símbolo.tipo, TipoPrimitivo.INTEIRO);

    return valor === undefined ? undefined : this.aplicarAtribuição(nó, símbolo.tipo, valor);
  }

  // -------------------------------------------------------------------------------------
  // Chamadas de função
  // -------------------------------------------------------------------------------------

  /**
   * A ordem das checagens é a do Java (`visitar(NoChamadaFuncao)`) — inclusive a visita aos
   * argumentos acontecer no meio dela, junto com a checagem de tipos.
   */
  private visitarChamadaFunção(nó: ChamadaFunçãoExpr): TipoPrimitivo | undefined {
    const alvo = this.resolverAlvoChamada(nó);

    // Como o Java, uma chamada cujo alvo não resolve não tem os argumentos visitados: sem
    // os modos de acesso esperados, passar um vetor viraria "vetor usado como variável".
    if (!alvo) {
      return undefined;
    }

    this.verificarQuantidadeParâmetros(nó, alvo);

    const tipos = this.visitarArgumentos(nó, alvo);

    this.verificarTiposParâmetros(nó, alvo, tipos);
    this.verificarQuantificadores(nó, alvo);
    this.verificarModoAcesso(nó, alvo);
    this.verificarParâmetrosExcedentes(nó, alvo);

    return alvo.retorno;
  }

  private resolverAlvoChamada(nó: ChamadaFunçãoExpr): AlvoChamada | undefined {
    if (nó.escopoBiblioteca === undefined) {
      if (FUNÇÕES_RESERVADAS.has(nó.nome)) {
        // `sorteia` é reservada no Portugol Studio, mas o nosso runtime só tem `Util.sorteia`.
        if (!funçãoReservadaImplementada(nó.nome)) {
          this.registrar(erroFunçãoReservadaNãoSuportada(nó.nomeToken, nó.nome));
        }

        return alvoReservado(nó.nome);
      }

      const símbolo = this.memória.obterSímbolo(nó.nome);

      if (!símbolo) {
        this.registrar(erroSímboloNãoDeclarado(nó.nomeToken, nó.nome, "função"));

        return undefined;
      }

      if (símbolo.classe !== "função") {
        this.registrar(erroReferênciaInválida(nó, símbolo, "função"));

        return undefined;
      }

      return {
        nome: nó.nome,
        reservada: false,
        esperados: símbolo.parâmetros.length,
        parâmetros: símbolo.parâmetros.map(parâmetro => {
          return {
            nome: parâmetro.nome,
            tipo: parâmetro.tipo.primitivo,
            quantificador: quantificadorDaDimensão(parâmetro.tipo.dimensão),
            porReferência: parâmetro.referência,
          };
        }),
        retorno: símbolo.tipo,
      };
    }

    const biblioteca = this.bibliotecas.get(nó.escopoBiblioteca);

    if (!biblioteca) {
      // O Portugol Studio reporta na posição do nome da função, não do escopo.
      this.registrar(erroInclusãoBiblioteca(nó.nomeToken, { tipo: "nãoIncluída", escopo: nó.escopoBiblioteca }));

      return undefined;
    }

    const função = obterFunção(biblioteca, nó.nome);

    if (!função) {
      this.registrar(erroSímboloNãoDeclarado(nó.nomeToken, nó.nome, "função", nó.escopoBiblioteca));

      return undefined;
    }

    // A biblioteca é suportada, mas esta função dela não; se a biblioteca inteira faltasse, a
    // inclusão já teria rendido o erro.
    if (bibliotecaImplementada(biblioteca) && !funçãoImplementada(biblioteca, nó.nome)) {
      this.registrar(erroSímboloBibliotecaNãoSuportado(nó.nomeToken, biblioteca, nó.nome, "função"));
    }

    return {
      nome: nó.nome,
      reservada: false,
      esperados: função.parâmetros.length,
      parâmetros: função.parâmetros.map(parâmetro => {
        return {
          nome: parâmetro.nome,
          tipo: tipoDaBiblioteca(parâmetro.tipo),
          quantificador: quantificadorDaDimensão(parâmetro.tipo.dimensão),
          porReferência: Boolean(parâmetro.tipo.dimensão),
        };
      }),
      retorno: comoPrimitivo(tipoDaBiblioteca(função.retorno.tipo)),
    };
  }

  private verificarQuantidadeParâmetros(nó: ChamadaFunçãoExpr, alvo: AlvoChamada) {
    const passados = nó.argumentos.length;
    const esperados = alvo.esperados;
    const ilimitados = esperados === PARÂMETROS_ILIMITADOS;

    // `escreva` e `leia` aceitam qualquer número de parâmetros, menos nenhum.
    if ((ilimitados && passados === 0) || (!ilimitados && passados !== esperados)) {
      this.registrar(erroNúmeroParâmetrosFunção(nó.nomeToken, alvo.nome, esperados, passados));
    }
  }

  private verificarTiposParâmetros(
    nó: ChamadaFunçãoExpr,
    alvo: AlvoChamada,
    tipos: ReadonlyArray<TipoPrimitivo | undefined>,
  ) {
    if (alvo.reservada && alvo.nome === "sorteia") {
      for (const [índice, tipo] of tipos.slice(0, 2).entries()) {
        if (tipo !== undefined && tipo !== TipoPrimitivo.INTEIRO) {
          this.registrar(
            erroTipoParâmetroIncompatível(nó.argumentos[índice], alvo.nome, "", TipoPrimitivo.INTEIRO, tipo),
          );
        }
      }
    }

    // `escreva(f())` com `f` do tipo `vazio`.
    if (alvo.reservada && alvo.nome === "escreva") {
      for (const [índice, tipo] of tipos.entries()) {
        if (tipo === TipoPrimitivo.VAZIO) {
          this.registrar(erroEscreverFunçãoSemRetorno(nó.argumentos[índice]));
        }
      }
    }

    const total = Math.min(alvo.parâmetros.length, tipos.length);

    for (let índice = 0; índice < total; índice++) {
      const passado = tipos[índice];

      if (passado === undefined) {
        continue;
      }

      const parâmetro = alvo.parâmetros[índice];
      const resultado = consultarCompatibilidade("chamadaFuncao", parâmetro.tipo, passado);

      // Um parâmetro por referência não pode ser convertido: o valor teria de voltar,
      // então para ele a conversão é erro, e não aviso.
      if (resultado.situação === "incompatível" || (resultado.situação === "conversão" && parâmetro.porReferência)) {
        this.registrar(
          erroTipoParâmetroIncompatível(nó.argumentos[índice], alvo.nome, parâmetro.nome, parâmetro.tipo, passado),
        );
      } else if (resultado.situação === "conversão") {
        this.registrar(
          avisoValorSeráConvertido(
            nó.argumentos[índice],
            { tipo: "parâmetro", função: alvo.nome, parâmetro: parâmetro.nome },
            resultado.de,
            resultado.resultado,
          ),
        );
      }
    }
  }

  private verificarQuantificadores(nó: ChamadaFunçãoExpr, alvo: AlvoChamada) {
    const total = Math.min(alvo.parâmetros.length, nó.argumentos.length);

    for (let índice = 0; índice < total; índice++) {
      const passado = this.quantificadorDoArgumento(nó.argumentos[índice]);
      const esperado = alvo.parâmetros[índice].quantificador;

      if (passado !== undefined && passado !== esperado) {
        this.registrar(
          erroQuantificadorParâmetroFunção(
            nó.argumentos[índice],
            alvo.nome,
            alvo.parâmetros[índice].nome,
            esperado,
            passado,
          ),
        );
      }
    }
  }

  /**
   * `undefined` quando não há como saber (símbolo inexistente, ou nome de função). O Java não
   * acrescenta nada à lista nesses casos e desalinha os índices seguintes, chegando a acusar o
   * parâmetro errado; aqui a posição é preservada e a checagem é apenas pulada.
   */
  private quantificadorDoArgumento(argumento: AtribuiçãoCmd | Expressão): QuantificadorParâmetro | undefined {
    if (argumento instanceof InicializaçãoVetorExpr) {
      return "vetor";
    }

    if (argumento instanceof InicializaçãoMatrizExpr) {
      return "matriz";
    }

    if (!(argumento instanceof ReferênciaVarExpr)) {
      return "valor";
    }

    if (argumento.escopoBiblioteca !== undefined) {
      // Todas as constantes de biblioteca são valores.
      return "valor";
    }

    const símbolo = this.memória.obterSímbolo(argumento.nome);

    switch (símbolo?.classe) {
      case "variável": {
        return "valor";
      }

      case "vetor": {
        return "vetor";
      }

      case "matriz": {
        return "matriz";
      }

      default: {
        return undefined;
      }
    }
  }

  private verificarModoAcesso(nó: ChamadaFunçãoExpr, alvo: AlvoChamada) {
    if (alvo.reservada && alvo.nome === "leia") {
      for (const [índice, argumento] of nó.argumentos.entries()) {
        if (!this.éReferênciaAtribuível(argumento)) {
          this.registrar(erroPassagemParâmetroInválida(argumento, { tipo: "leia", posição: índice }));
        }
      }

      return;
    }

    for (const [índice, argumento] of nó.argumentos.entries()) {
      const parâmetro = alvo.parâmetros[índice];

      if (!parâmetro?.porReferência) {
        continue;
      }

      if (!this.éReferênciaAtribuível(argumento, true)) {
        this.registrar(
          erroPassagemParâmetroInválida(argumento, {
            tipo: "referência",
            função: alvo.nome,
            parâmetro: parâmetro.nome,
          }),
        );
      }
    }
  }

  /**
   * `somenteNomeInteiro` distingue os dois casos do Java: `leia(v[0])` é aceito (basta ser
   * referência), mas um parâmetro por referência exige o símbolo inteiro.
   */
  private éReferênciaAtribuível(argumento: AtribuiçãoCmd | Expressão, somenteNomeInteiro = false): boolean {
    if (argumento instanceof ReferênciaArrayExpr || argumento instanceof ReferênciaMatrizExpr) {
      return !somenteNomeInteiro;
    }

    if (!(argumento instanceof ReferênciaVarExpr) || argumento.escopoBiblioteca !== undefined) {
      return false;
    }

    const símbolo = this.memória.obterSímbolo(argumento.nome);

    return símbolo !== undefined && !símbolo.constante;
  }

  private verificarParâmetrosExcedentes(nó: ChamadaFunçãoExpr, alvo: AlvoChamada) {
    for (const argumento of nó.argumentos.slice(alvo.esperados)) {
      this.registrar(erroParâmetroExcedente(argumento, alvo.nome));
    }
  }

  /**
   * `passandoReferência` e `passandoParâmetro` são o que impede `soma(v)` e
   * `Util.numero_elementos(v)` de acusarem "o vetor 'v' está sendo utilizado como uma
   * variável", enquanto `escreva(v)` continua acusando.
   */
  private visitarArgumentos(nó: ChamadaFunçãoExpr, alvo: AlvoChamada): Array<TipoPrimitivo | undefined> {
    const tipos: Array<TipoPrimitivo | undefined> = [];
    // Só função do usuário liga `passandoParametro` no Java.
    const funçãoDoUsuário = nó.escopoBiblioteca === undefined && !alvo.reservada;

    const éLeia = alvo.reservada && alvo.nome === "leia";
    const alvoAnterior = this.alvoDeAtribuição;

    for (const [índice, argumento] of nó.argumentos.entries()) {
      this.passandoReferência = alvo.parâmetros[índice]?.porReferência ?? false;

      if (éLeia) {
        const alvoLeitura = this.formaEIdentificadorDaReferência(
          argumento instanceof Expressão ? argumento : undefined,
        );
        const símbolo = alvoLeitura ? this.memória.obterSímbolo(alvoLeitura.nome) : undefined;

        if (!símbolo && argumento instanceof ReferênciaVarExpr) {
          this.registrar(erroSímboloNãoDeclarado(argumento.nomeToken, argumento.nome, "variável"));
          this.passandoReferência = false;
          this.alvoDeAtribuição = alvoAnterior;

          // O Java também abandona os argumentos restantes neste caso.
          return tipos;
        }

        if (símbolo) {
          // `leia(x)` inicializa `x`.
          símbolo.inicializado = true;
          símbolo.escritas++;
        }
      }

      // `leia(x)` preenche `x`, não o lê: sem isto o argumento contaria como leitura e uma
      // variável que só é lida do teclado nunca cairia no aviso "nunca é lida".
      this.alvoDeAtribuição = éLeia && argumento instanceof Expressão ? argumento : alvoAnterior;
      this.passandoParâmetro = funçãoDoUsuário;
      tipos.push(this.resolverTipo(argumento));
      this.passandoParâmetro = false;
      this.passandoReferência = false;
    }

    this.alvoDeAtribuição = alvoAnterior;

    return tipos;
  }
}

/**
 * O alvo de uma chamada, venha ele de uma função do usuário, de uma biblioteca ou de uma das
 * quatro funções reservadas da linguagem.
 */
interface AlvoChamada {
  readonly nome: string;

  readonly reservada: boolean;

  /**
   * `PARÂMETROS_ILIMITADOS` para `escreva` e `leia`.
   */
  readonly esperados: number;

  /**
   * Vazio para as funções reservadas: o Portugol Studio não descreve os parâmetros delas,
   * e por isso as checagens de tipo e quantificador só valem para as outras.
   */
  readonly parâmetros: ReadonlyArray<{
    nome: string;
    porReferência: boolean;
    quantificador: QuantificadorParâmetro;
    tipo: TipoOperando;
  }>;

  readonly retorno: TipoPrimitivo | undefined;
}

function alvoReservado(nome: string): AlvoChamada {
  const esperados = nome === "limpa" ? 0 : nome === "sorteia" ? 2 : PARÂMETROS_ILIMITADOS;

  return {
    nome,
    reservada: true,
    esperados,
    parâmetros: [],
    retorno: nome === "sorteia" ? TipoPrimitivo.INTEIRO : TipoPrimitivo.VAZIO,
  };
}

function quantificadorDaDimensão(dimensão: "matriz" | "vetor" | undefined): QuantificadorParâmetro {
  return dimensão ?? "valor";
}

export function analisar(arquivo: Arquivo, opções?: OpçõesAnálise): PortugolCodeDiagnostic[] {
  return new AnalisadorSemântico(opções).analisar(arquivo);
}
