import { tipoNoCódigo } from "../analise/TipoDado.js";
import {
  assinatura,
  descriçãoDoParâmetro,
  documentaçãoDaFunção,
  listaDeParâmetros,
  parâmetroNaAssinatura,
} from "../bibliotecas/assinaturas.js";
import { type FunçãoBiblioteca, obterFunção } from "../bibliotecas/metadados.js";
import { funçãoImplementada } from "../bibliotecas/suporte.js";
import { parâmetroNoCódigo, type SímboloDeclarado } from "./símbolos.js";

/**
 * Uma função que pode ser chamada, do programa, de uma biblioteca ou da linguagem, como as
 * sugestões e a ajuda de assinatura a mostram.
 */
export interface Chamável {
  nome: string;
  /**
   * `funcao real potencia(real base, real expoente)`.
   */
  assinatura: string;
  /**
   * Só os parênteses: `(real base, real expoente)`.
   */
  parâmetrosNaAssinatura: string;
  retorno: string;
  parâmetros: Array<{ rótulo: string; documentação?: string }>;
  /**
   * `escreva` e `leia` recebem quantos valores a pessoa quiser.
   */
  ilimitado: boolean;
  documentação?: string;
  /**
   * Para a ajuda de assinatura, que mostra cada parâmetro à parte.
   */
  documentaçãoSemParâmetros?: string;
  /**
   * A página da Ajuda, como nos endereços `#ajuda=`, das funções da linguagem que têm uma só
   * delas. As das bibliotecas saem de `páginaNaAjuda`.
   */
  ajuda?: string;
}

function montar(nome: string, retorno: string, parâmetros: Chamável["parâmetros"], extra: Partial<Chamável> = {}) {
  const rótulos = parâmetros.map(p => p.rótulo);

  return {
    nome,
    assinatura: assinatura(retorno, nome, rótulos),
    parâmetrosNaAssinatura: listaDeParâmetros(rótulos),
    retorno,
    parâmetros,
    ilimitado: false,
    ...extra,
  } satisfies Chamável;
}

/**
 * Os metadados não mudam: cada função da biblioteca é montada uma vez só.
 */
const DAS_BIBLIOTECAS = new WeakMap<FunçãoBiblioteca, Chamável>();

export function chamávelDaBiblioteca(função: FunçãoBiblioteca): Chamável {
  let chamável = DAS_BIBLIOTECAS.get(função);

  if (!chamável) {
    chamável = montar(
      função.nome,
      tipoNoCódigo(função.retorno.tipo.primitivo, função.retorno.tipo.dimensão),
      função.parâmetros.map(p => ({ rótulo: parâmetroNaAssinatura(p), documentação: descriçãoDoParâmetro(p) })),
      {
        documentação: documentaçãoDaFunção(função),
        documentaçãoSemParâmetros: documentaçãoDaFunção(função, { comParâmetros: false }),
      },
    );
    DAS_BIBLIOTECAS.set(função, chamável);
  }

  return chamável;
}

/**
 * A função da biblioteca, se o Webstudio a executa: o analisador recusa o resto.
 */
export function funçãoDaBiblioteca(biblioteca: string, nome: string): Chamável | undefined {
  const função = obterFunção(biblioteca, nome);

  return função && funçãoImplementada(biblioteca, nome) ? chamávelDaBiblioteca(função) : undefined;
}

export function chamávelDoPrograma(função: SímboloDeclarado): Chamável {
  return montar(
    função.nome,
    função.tipo,
    função.parâmetros.map(p => ({ rótulo: parâmetroNoCódigo(p) })),
  );
}

function reservada(nome: string, documentação: string, parâmetros: Chamável["parâmetros"], ilimitado = false) {
  return montar(nome, "vazio", parâmetros, {
    documentação,
    documentaçãoSemParâmetros: documentação,
    ilimitado,
    ajuda: `topicos/linguagem_portugol/entrada_saida/${nome}.md`,
  });
}

/**
 * As funções da linguagem, que não precisam de biblioteca. A `sorteia` é a mesma da `Util`.
 */
export const FUNÇÕES_DA_LINGUAGEM: ReadonlyMap<string, Chamável> = new Map([
  [
    "escreva",
    reservada(
      "escreva",
      "Escreve no console os valores entre parênteses, um depois do outro. Eles podem ser textos, variáveis ou operações, separados por vírgulas.",
      [{ rótulo: "...", documentação: "os valores, separados por vírgulas" }],
      true,
    ),
  ],
  [
    "leia",
    reservada(
      "leia",
      "Espera um valor ser digitado no console e o guarda na variável entre parênteses. Com mais de uma variável, separadas por vírgulas, lê um valor para cada uma.",
      [{ rótulo: "...", documentação: "as variáveis, separadas por vírgulas" }],
      true,
    ),
  ],
  ["limpa", reservada("limpa", "Limpa o console.", [])],
  ["sorteia", chamávelDaBiblioteca(obterFunção("Util", "sorteia")!)],
]);
