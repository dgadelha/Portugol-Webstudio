import type { Símbolo } from "./Símbolo.js";

/**
 * Porta de `simbolos/TabelaSimbolos.java`: uma pilha de sub-escopos.
 */
class TabelaSímbolos {
  private readonly escopos: Array<Map<string, Símbolo>> = [new Map()];

  empilharEscopo() {
    this.escopos.push(new Map());
  }

  desempilharEscopo(): Map<string, Símbolo> | undefined {
    return this.escopos.pop();
  }

  adicionar(símbolo: Símbolo) {
    this.escopos.at(-1)?.set(símbolo.nome, símbolo);
  }

  escopoAtual(): Map<string, Símbolo> | undefined {
    return this.escopos.at(-1);
  }

  obter(nome: string): Símbolo | undefined {
    for (let i = this.escopos.length - 1; i >= 0; i--) {
      const símbolo = this.escopos[i].get(nome);

      if (símbolo) {
        return símbolo;
      }
    }

    return undefined;
  }
}

/**
 * Porta de `simbolos/Memoria.java`: escopo global mais uma pilha de funções — que nunca
 * passa de uma entrada (o Portugol não tem closures), mas existe para espelhar o Java.
 * Cada nível tem sua própria pilha de sub-escopos, empilhada a cada lista de blocos e em
 * volta do `para` inteiro.
 */
export class Memória {
  private readonly escopoGlobal = new TabelaSímbolos();
  private readonly escoposLocais: TabelaSímbolos[] = [];

  obterSímbolo(nome: string): Símbolo | undefined {
    return this.escoposLocais.at(-1)?.obter(nome) ?? this.escopoGlobal.obter(nome);
  }

  adicionarSímbolo(símbolo: Símbolo) {
    (this.escoposLocais.at(-1) ?? this.escopoGlobal).adicionar(símbolo);
  }

  empilharFunção() {
    this.escoposLocais.push(new TabelaSímbolos());
  }

  /**
   * Devolve os parâmetros: é o escopo que sobra depois de o corpo ter sido desempilhado.
   */
  desempilharFunção(): Map<string, Símbolo> | undefined {
    return this.escoposLocais.pop()?.desempilharEscopo();
  }

  empilharEscopo() {
    (this.escoposLocais.at(-1) ?? this.escopoGlobal).empilharEscopo();
  }

  /**
   * Divergência intencional: no ramo global o `Memoria.desempilharEscopo()` do Java
   * **empilha**, deixando visível a declaração global recusada por redeclaração — que
   * sobrescreve a original e, se ela for uma função, estoura `ClassCastException` no
   * Portugol Studio. Aqui desempilhamos de verdade.
   */
  desempilharEscopo(): Map<string, Símbolo> | undefined {
    return (this.escoposLocais.at(-1) ?? this.escopoGlobal).desempilharEscopo();
  }

  /**
   * O escopo global sem desempilhá-lo: no fim da análise ele só é inspecionado, e
   * desempilhar deixaria a memória sem escopo nenhum — onde `adicionarSímbolo` vira um
   * no-op silencioso.
   */
  escopoGlobalAtual(): Map<string, Símbolo> | undefined {
    return this.escopoGlobal.escopoAtual();
  }

  éEscopoGlobal(): boolean {
    return this.escoposLocais.length === 0;
  }

  éGlobal(símbolo: Símbolo): boolean {
    return this.escopoGlobal.obter(símbolo.nome) === símbolo;
  }

  éLocal(símbolo: Símbolo): boolean {
    return this.escoposLocais.at(-1)?.obter(símbolo.nome) === símbolo;
  }
}
