import { TipoPrimitivo } from "../analise/TipoDado.js";
import { assinaturaDaConstante, nomeDoTipo } from "../bibliotecas/assinaturas.js";
import { obterBiblioteca } from "../bibliotecas/metadados.js";
import { BIBLIOTECAS_IMPLEMENTADAS, constanteImplementada, funçãoImplementada } from "../bibliotecas/suporte.js";
import { type Chamável, chamávelDaBiblioteca, chamávelDoPrograma, FUNÇÕES_DA_LINGUAGEM } from "./chamáveis.js";
import { analisarContexto, type Contexto, type Intervalo, type Lugar, type Posição } from "./contexto.js";
import { bloco } from "./markdown.js";
import {
  type BibliotecaIncluída,
  bibliotecaIncluída,
  coletarSímbolos,
  declaraçãoNoCódigo,
  type SímboloDeclarado,
  símbolosVisíveis,
  tipoDoSímbolo,
} from "./símbolos.js";
import {
  prévia,
  type Trecho,
  TRECHO_PROGRAMA,
  TRECHO_SENAO_SE,
  TRECHOS_DA_FUNÇÃO,
  TRECHOS_DO_PROGRAMA,
} from "./trechos.js";

export type TipoItem = "variável" | "constante" | "função" | "biblioteca" | "palavra" | "trecho";

export interface ItemCompletar {
  rótulo: string;
  /**
   * Logo depois do rótulo, mais apagado: os parâmetros de uma função.
   */
  detalheDoRótulo?: string;
  /**
   * À direita do rótulo: o tipo, ou o nome da biblioteca de um apelido.
   */
  descrição?: string;
  tipo: TipoItem;
  /**
   * A declaração, no alto da documentação.
   */
  detalhe?: string;
  /**
   * Em Markdown.
   */
  documentação?: string;
  inserir: string;
  /**
   * `inserir` tem paradas de tabulação (`$0`, `${1:condicao}`).
   */
  trecho: boolean;
  ordem: string;
  /**
   * O que abrir depois de inserir: a ajuda de assinatura, com o parêntese aberto.
   */
  comando?: "ajudaDeAssinatura";
  /**
   * A palavra que o item substitui, na linha do cursor: de `início` até o cursor, ou até `fim`
   * para trocar a palavra inteira.
   */
  intervalo: Intervalo;
}

/**
 * A ordem dos grupos na lista, antes de a pessoa digitar: o que é mais provável vem antes.
 */
const GRUPO = {
  local: "1",
  global: "2",
  função: "3",
  biblioteca: "4",
  palavra: "5",
  trecho: "6",
} as const;

// Os tipos de variáveis e parâmetros: `vazio` só serve de retorno.
const TIPOS = Object.values(TipoPrimitivo).filter(tipo => tipo !== TipoPrimitivo.VAZIO);
const VALORES = ["verdadeiro", "falso", "nao", "e", "ou"];
const COMANDOS = ["se", "enquanto", "faca", "para", "escolha", "retorne", "const"];

/**
 * As sugestões para a posição, como as do VS Code: o que o programa declarou e é visível ali,
 * as bibliotecas incluídas e, depois de `apelido.`, as funções e constantes dela.
 */
export function completar(código: string, posição: Posição): ItemCompletar[] {
  const contexto = analisarContexto(código, posição);
  const intervalo = { linha: posição.linha, início: contexto.colunaInicial, fim: contexto.colunaFinal };

  return new Completador(código, contexto, intervalo).itens();
}

class Completador {
  private readonly lista: ItemCompletar[] = [];

  constructor(
    private readonly código: string,
    private readonly contexto: Contexto,
    private readonly intervalo: ItemCompletar["intervalo"],
  ) {}

  /**
   * Onde começa a palavra que está sendo escrita, em pontos de código.
   */
  private get inícioDaPalavra() {
    return this.contexto.deslocamento - this.contexto.palavra.length;
  }

  itens(): ItemCompletar[] {
    const { lugar } = this.contexto;

    switch (lugar.tipo) {
      case "nada": {
        break;
      }

      case "foraDoPrograma": {
        this.palavras(["programa"]);
        this.trechos([TRECHO_PROGRAMA]);
        break;
      }

      case "inclua": {
        this.palavras(["biblioteca"]);
        break;
      }

      case "nomeDaBiblioteca": {
        this.nomesDeBibliotecas();
        break;
      }

      case "membro": {
        this.membros(lugar.biblioteca);
        break;
      }

      case "tipos": {
        this.palavras(TIPOS);
        break;
      }

      case "código": {
        this.noCódigo(lugar);
        break;
      }
    }

    return this.lista;
  }

  private noCódigo(lugar: Extract<Lugar, { tipo: "código" }>) {
    if (lugar.noPrograma && !lugar.expressão) {
      this.palavras(["funcao", "inclua", "const", ...TIPOS]);
      this.trechos(TRECHOS_DO_PROGRAMA);

      return;
    }

    const programa = coletarSímbolos(this.código);

    for (const símbolo of símbolosVisíveis(programa, this.contexto.deslocamento)) {
      // A palavra que está sendo escrita pode ter virado uma declaração na árvore remendada.
      if (símbolo.posição !== this.inícioDaPalavra) {
        this.símbolo(símbolo);
      }
    }

    for (const biblioteca of programa.bibliotecas) {
      this.biblioteca(biblioteca);
    }

    if (!lugar.noPrograma) {
      for (const função of FUNÇÕES_DA_LINGUAGEM.values()) {
        this.chamável(função, GRUPO.biblioteca);
      }
    }

    if (lugar.expressão) {
      this.palavras([...VALORES, ...(lugar.inícioDoPara ? TIPOS : []), ...(lugar.depoisDoCaso ? ["contrario"] : [])]);

      return;
    }

    this.palavras([
      ...COMANDOS,
      ...(lugar.depoisDoSe ? ["senao"] : []),
      ...(lugar.emEscolha ? ["caso", "caso contrario"] : []),
      ...(lugar.cabePare ? ["pare"] : []),
      ...TIPOS,
    ]);
    this.trechos([...TRECHOS_DA_FUNÇÃO, ...(lugar.depoisDoSe ? [TRECHO_SENAO_SE] : [])]);
  }

  private símbolo(símbolo: SímboloDeclarado) {
    if (símbolo.classe === "função") {
      this.chamável(chamávelDoPrograma(símbolo), GRUPO.função);

      return;
    }

    const grupo = símbolo.origem === "global" ? GRUPO.global : GRUPO.local;

    this.adicionar({
      rótulo: símbolo.nome,
      descrição: tipoDoSímbolo(símbolo),
      tipo: símbolo.constante ? "constante" : "variável",
      detalhe: declaraçãoNoCódigo(símbolo),
      inserir: símbolo.nome,
      trecho: false,
      ordem: grupo + símbolo.nome,
    });
  }

  /**
   * Com apelido, a biblioteca aparece pelo apelido; o nome também funciona, mas é o apelido que
   * a pessoa escolheu usar.
   */
  private biblioteca(incluída: BibliotecaIncluída) {
    const biblioteca = obterBiblioteca(incluída.nome);

    // A inclusão que está sendo escrita ainda não tem o nome inteiro.
    if (!biblioteca || incluída.posição === this.inícioDaPalavra) {
      return;
    }

    const rótulo = incluída.alias ?? biblioteca.nome;

    this.adicionar({
      rótulo,
      descrição: incluída.alias ? biblioteca.nome : undefined,
      tipo: "biblioteca",
      detalhe: `biblioteca ${biblioteca.nome}`,
      documentação: biblioteca.descrição,
      inserir: rótulo,
      trecho: false,
      ordem: GRUPO.biblioteca + rótulo,
    });
  }

  private nomesDeBibliotecas() {
    const programa = coletarSímbolos(this.código);
    const incluídas = new Set(programa.bibliotecas.filter(b => b.posição !== this.inícioDaPalavra).map(b => b.nome));

    for (const nome of BIBLIOTECAS_IMPLEMENTADAS) {
      const biblioteca = obterBiblioteca(nome);

      if (!biblioteca || incluídas.has(nome)) {
        continue;
      }

      this.adicionar({
        rótulo: nome,
        tipo: "biblioteca",
        detalhe: `biblioteca ${nome}`,
        documentação: biblioteca.descrição,
        inserir: nome,
        trecho: false,
        ordem: GRUPO.biblioteca + nome,
      });
    }
  }

  /**
   * Depois do ponto, só a biblioteca incluída com esse nome ou apelido, como o analisador aceita.
   */
  private membros(nome: string) {
    const biblioteca = bibliotecaIncluída(coletarSímbolos(this.código), nome);

    if (!biblioteca) {
      return;
    }

    for (const constante of biblioteca.constantes) {
      if (constanteImplementada(biblioteca.nome, constante.nome)) {
        this.adicionar({
          rótulo: constante.nome,
          descrição: `const ${nomeDoTipo(constante.tipo)}`,
          tipo: "constante",
          detalhe: assinaturaDaConstante(constante),
          documentação: constante.descrição.trim(),
          inserir: constante.nome,
          trecho: false,
          ordem: GRUPO.local + constante.nome,
        });
      }
    }

    for (const função of biblioteca.funções) {
      if (funçãoImplementada(biblioteca.nome, função.nome)) {
        this.chamável(chamávelDaBiblioteca(função), GRUPO.local);
      }
    }
  }

  /**
   * Como no `completeFunctionCalls` do VS Code, a função entra com os parênteses e o cursor
   * entre eles, e a ajuda de assinatura mostra os parâmetros. Sem nomes de parâmetros no código:
   * eles ficariam lá se a pessoa só apertasse Tab.
   */
  private chamável(função: Chamável, grupo: string) {
    const temParênteses = this.contexto.depoisDaPalavra.trimStart().startsWith("(");
    const temParâmetros = função.ilimitado || função.parâmetros.length > 0;
    let inserir = `${função.nome}()$0`;

    if (temParênteses) {
      inserir = função.nome;
    } else if (temParâmetros) {
      inserir = `${função.nome}($0)`;
    }

    this.adicionar({
      rótulo: função.nome,
      detalheDoRótulo: função.parâmetrosNaAssinatura,
      descrição: função.retorno === "vazio" ? undefined : função.retorno,
      tipo: "função",
      detalhe: função.assinatura,
      documentação: função.documentação,
      inserir,
      trecho: !temParênteses,
      ordem: grupo + função.nome,
      comando: !temParênteses && temParâmetros ? "ajudaDeAssinatura" : undefined,
    });
  }

  private palavras(palavras: readonly string[]) {
    for (const palavra of palavras) {
      this.adicionar({
        rótulo: palavra,
        tipo: "palavra",
        inserir: palavra,
        trecho: false,
        ordem: GRUPO.palavra + palavra,
      });
    }
  }

  private trechos(trechos: readonly Trecho[]) {
    for (const trecho of trechos) {
      this.adicionar({
        rótulo: trecho.palavra,
        descrição: trecho.descrição,
        tipo: "trecho",
        detalhe: trecho.descrição,
        documentação: bloco(prévia(trecho)),
        inserir: trecho.código,
        trecho: true,
        ordem: GRUPO.trecho + trecho.palavra,
      });
    }
  }

  private adicionar(item: Omit<ItemCompletar, "intervalo">) {
    this.lista.push({ ...item, intervalo: this.intervalo });
  }
}
