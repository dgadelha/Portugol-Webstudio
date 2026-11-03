import { PortugolLexer } from "@portugol-webstudio/antlr";
import type { Token } from "antlr4ng";

import { type Chamável, chamávelDoPrograma, funçãoDaBiblioteca, FUNÇÕES_DA_LINGUAGEM } from "./chamáveis.js";
import { analisarContexto, BLOCO_DO_COMANDO, éListaDeParâmetros, type Posição } from "./contexto.js";
import { bibliotecaIncluída, coletarSímbolos } from "./símbolos.js";

export interface AjudaAssinatura {
  /**
   * A assinatura inteira: `funcao real potencia(real base, real expoente)`.
   */
  rótulo: string;
  /**
   * Em Markdown.
   */
  documentação?: string;
  /**
   * Onde cada parâmetro está no rótulo, do primeiro caractere até depois do último.
   */
  parâmetros: Array<{ rótulo: [number, number]; documentação?: string }>;
  /**
   * Conta as vírgulas: pode passar do último parâmetro.
   */
  parâmetroAtivo: number;
}

/**
 * Entre os argumentos de uma chamada só cabem expressões: um destes tokens fora de parênteses
 * quer dizer que o cursor não está numa chamada.
 */
const FORA_DE_CHAMADA = new Set([
  PortugolLexer.ABRE_CHAVES,
  PortugolLexer.FECHA_CHAVES,
  PortugolLexer.SE,
  PortugolLexer.SENAO,
  PortugolLexer.ENQUANTO,
  PortugolLexer.FACA,
  PortugolLexer.PARA,
  PortugolLexer.ESCOLHA,
  PortugolLexer.CASO,
  PortugolLexer.RETORNE,
  PortugolLexer.PARE,
  PortugolLexer.FUNCAO,
  PortugolLexer.PROGRAMA,
  PortugolLexer.INCLUA,
  PortugolLexer.TIPO,
  PortugolLexer.CONSTANTE,
  PortugolLexer.DOISPONTOS,
  PortugolLexer.PONTOVIRGULA,
]);

/**
 * A assinatura da chamada mais interna que está aberta no cursor, com o parâmetro em que ele
 * está.
 */
export function ajudaDeAssinatura(código: string, posição: Posição): AjudaAssinatura | null {
  const contexto = analisarContexto(código, posição);

  if (contexto.emTextoOuComentário) {
    return null;
  }

  const chamada = chamadaAberta(contexto.tokens);

  if (!chamada) {
    return null;
  }

  const função = procurar(código, chamada.nome, chamada.biblioteca);

  return função ? montarAjuda(função, função.ilimitado ? 0 : chamada.vírgulas) : null;
}

/**
 * Volta pelos tokens até o `(` que ficou aberto, pulando os parênteses e colchetes fechados, e
 * conta as vírgulas que separam os argumentos dele.
 */
function chamadaAberta(tokens: Token[]) {
  let profundidade = 0;
  let vírgulas = 0;

  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];

    switch (token.type) {
      case PortugolLexer.FECHA_PARENTESES:
      case PortugolLexer.FECHA_COLCHETES: {
        profundidade++;
        continue;
      }

      case PortugolLexer.ABRE_COLCHETES: {
        if (profundidade > 0) {
          profundidade--;
        } else {
          // Dentro de um índice, como em `f(v[▮`: o argumento ainda é o mesmo.
          vírgulas = 0;
        }

        continue;
      }

      case PortugolLexer.ABRE_PARENTESES: {
        if (profundidade > 0) {
          profundidade--;
          continue;
        }

        const nome = tokens[i - 1];

        if (nome?.type !== PortugolLexer.ID) {
          if (nome && BLOCO_DO_COMANDO.has(nome.type)) {
            return null;
          }

          // Parênteses de agrupamento, como em `f((a + ▮`.
          vírgulas = 0;
          continue;
        }

        if (éListaDeParâmetros(tokens, i)) {
          return null;
        }

        const ponto = tokens[i - 2]?.type === PortugolLexer.PONTO;
        const biblioteca = ponto && tokens[i - 3]?.type === PortugolLexer.ID ? tokens[i - 3].text : undefined;

        return { nome: nome.text ?? "", biblioteca, vírgulas };
      }

      case PortugolLexer.VIRGULA: {
        if (profundidade === 0) {
          vírgulas++;
        }

        continue;
      }

      default: {
        if (profundidade === 0 && FORA_DE_CHAMADA.has(token.type)) {
          return null;
        }
      }
    }
  }

  return null;
}

function procurar(código: string, nome: string, escopo: string | undefined): Chamável | undefined {
  const programa = coletarSímbolos(código);

  if (escopo !== undefined) {
    const biblioteca = bibliotecaIncluída(programa, escopo);

    return biblioteca && funçãoDaBiblioteca(biblioteca.nome, nome);
  }

  const daLinguagem = FUNÇÕES_DA_LINGUAGEM.get(nome);

  if (daLinguagem) {
    return daLinguagem;
  }

  const doPrograma = programa.símbolos.find(s => s.classe === "função" && s.nome === nome);

  return doPrograma && chamávelDoPrograma(doPrograma);
}

function montarAjuda(função: Chamável, parâmetroAtivo: number): AjudaAssinatura {
  let início = função.assinatura.indexOf("(") + 1;

  const parâmetros = função.parâmetros.map(parâmetro => {
    const rótulo: [number, number] = [início, início + parâmetro.rótulo.length];

    início = rótulo[1] + ", ".length;

    return { rótulo, documentação: parâmetro.documentação };
  });

  return {
    rótulo: função.assinatura,
    documentação: função.documentaçãoSemParâmetros,
    parâmetros,
    parâmetroAtivo,
  };
}
