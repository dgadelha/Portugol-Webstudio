import { SUFIXO_DA_DIMENSÃO, tipoNoCódigo } from "../analise/TipoDado.js";
import type { ConstanteBiblioteca, FunçãoBiblioteca, TipoBiblioteca } from "./metadados.js";

/**
 * As funções e constantes das bibliotecas escritas como na Ajuda: a mesma assinatura e o
 * mesmo texto aparecem nas páginas da Ajuda e nas sugestões do editor.
 */
type ParâmetroBiblioteca = FunçãoBiblioteca["parâmetros"][number];

/**
 * `inteiro`, `real[]`… O tipo `*` dos metadados aceita qualquer tipo.
 */
export function nomeDoTipo(tipo: TipoBiblioteca) {
  const primitivo = tipo.primitivo === "*" ? "qualquer tipo" : tipo.primitivo;

  return tipoNoCódigo(primitivo, tipo.dimensão);
}

/**
 * Parâmetros vetores e matrizes são passados por referência no Portugol: `inteiro &vetor[]`.
 */
export function parâmetroNaAssinatura({ tipo, nome }: ParâmetroBiblioteca) {
  return tipo.dimensão ? `${tipo.primitivo} &${nome}${SUFIXO_DA_DIMENSÃO[tipo.dimensão]}` : `${tipo.primitivo} ${nome}`;
}

/**
 * `(real base, real expoente)`: o que a lista de sugestões mostra ao lado do nome.
 */
export function listaDeParâmetros(parâmetros: readonly string[]) {
  return `(${parâmetros.join(", ")})`;
}

/**
 * `funcao real potencia(real base, real expoente)`: das bibliotecas, da linguagem e do programa.
 */
export function assinatura(retorno: string, nome: string, parâmetros: readonly string[]) {
  return `funcao ${retorno} ${nome}${listaDeParâmetros(parâmetros)}`;
}

export function assinaturaDaFunção(função: FunçãoBiblioteca) {
  const retorno = função.retorno.tipo;

  return assinatura(
    tipoNoCódigo(retorno.primitivo, retorno.dimensão),
    função.nome,
    função.parâmetros.map(p => parâmetroNaAssinatura(p)),
  );
}

/**
 * Sem o valor, que a Ajuda escreve com o `portugolLiteral` do runner.
 */
export function assinaturaDaConstante(constante: ConstanteBiblioteca) {
  return `const ${nomeDoTipo(constante.tipo)} ${constante.nome}`;
}

/**
 * As descrições dos metadados podem ter várias linhas; nas listas, cabem numa só.
 */
export function emUmaLinha(texto: string) {
  return texto.replaceAll(/\s+/g, " ").trim();
}

/**
 * Um item da lista de parâmetros: `` `base` (real): o número que será elevado ao expoente ``.
 */
export function descriçãoDoParâmetro(parâmetro: ParâmetroBiblioteca) {
  return `\`${parâmetro.nome}\` (${nomeDoTipo(parâmetro.tipo)}): ${emUmaLinha(parâmetro.descrição)}`;
}

/**
 * O tipo e o que a função devolve, ou nada quando ela não devolve valor.
 */
export function descriçãoDoRetorno({ retorno }: FunçãoBiblioteca) {
  if (retorno.tipo.primitivo === "vazio") {
    return "";
  }

  return `${nomeDoTipo(retorno.tipo)}${retorno.descrição ? `: ${emUmaLinha(retorno.descrição)}` : ""}`;
}

/**
 * A documentação da função em Markdown, como nas sugestões do editor: a descrição, os
 * parâmetros e o retorno. Sem os parâmetros, para a ajuda de assinatura, que mostra cada um
 * à parte. Sem negrito nem títulos: o editor lê este texto cru para os leitores de tela.
 */
export function documentaçãoDaFunção(função: FunçãoBiblioteca, { comParâmetros = true } = {}) {
  const { tipo, descrição } = função.retorno;
  const retorno =
    tipo.primitivo === "vazio" ? "" : `Retorno (${nomeDoTipo(tipo)})${descrição ? `: ${emUmaLinha(descrição)}` : ""}`;

  return [
    função.descrição.trim(),
    comParâmetros && função.parâmetros.length > 0 ? "Parâmetros:" : "",
    comParâmetros ? função.parâmetros.map(p => `- ${descriçãoDoParâmetro(p)}`).join("\n") : "",
    retorno,
  ]
    .filter(Boolean)
    .join("\n\n");
}
