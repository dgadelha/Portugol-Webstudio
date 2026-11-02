import { BIBLIOTECAS_IMPLEMENTADAS } from "../bibliotecas/suporte.js";

/**
 * Um trecho de código com as paradas de tabulação do VS Code (`${1:condicao}`, `$0`). A
 * indentação é `\t`: o editor a troca pela das configurações ao inserir.
 */
export interface Trecho {
  palavra: string;
  descrição: string;
  código: string;
}

export const TRECHO_PROGRAMA: Trecho = {
  palavra: "programa",
  descrição: "Estrutura do programa",
  código: "programa {\n\tfuncao inicio() {\n\t\t$0\n\t}\n}",
};

export const TRECHOS_DO_PROGRAMA: readonly Trecho[] = [
  { palavra: "funcao", descrição: "Declaração de função", código: "funcao ${1:nome}($2) {\n\t$0\n}" },
  {
    palavra: "inclua",
    descrição: "Inclusão de biblioteca",
    código: `inclua biblioteca \${1|${BIBLIOTECAS_IMPLEMENTADAS.join(",")}|}$0`,
  },
];

export const TRECHO_SENAO_SE: Trecho = {
  palavra: "senao",
  descrição: "Desvio condicional senao se",
  código: "senao se (${1:condicao}) {\n\t$0\n}",
};

export const TRECHOS_DA_FUNÇÃO: readonly Trecho[] = [
  { palavra: "se", descrição: "Desvio condicional se", código: "se (${1:condicao}) {\n\t$0\n}" },
  {
    palavra: "se",
    descrição: "Desvio condicional se … senao",
    código: "se (${1:condicao}) {\n\t$2\n} senao {\n\t$0\n}",
  },
  { palavra: "enquanto", descrição: "Laço enquanto", código: "enquanto (${1:condicao}) {\n\t$0\n}" },
  { palavra: "faca", descrição: "Laço faca … enquanto", código: "faca {\n\t$0\n} enquanto (${1:condicao})" },
  {
    palavra: "para",
    descrição: "Laço para",
    código: "para (inteiro ${1:i} = ${2:0}; $1 < ${3:10}; $1++) {\n\t$0\n}",
  },
  {
    palavra: "escolha",
    descrição: "Desvio escolha … caso",
    código: "escolha (${1:valor}) {\n\tcaso ${2:1}:\n\t\t$3\n\t\tpare\n\tcaso contrario:\n\t\t$0\n}",
  },
];

/**
 * O código como fica depois de inserido, sem tocar em nada: cada parada com o texto dela, ou
 * a primeira opção.
 */
export function prévia(trecho: Trecho) {
  const valores = new Map<string, string>();

  return trecho.código.replaceAll(
    /\$\{(\d+)\|([^,|]*)[^}]*\}|\$\{(\d+):([^}]*)\}|\$\{(\d+)\}|\$(\d+)/g,
    (
      _: string,
      escolha?: string,
      opção?: string,
      comTexto?: string,
      texto?: string,
      entre?: string,
      solta?: string,
    ) => {
      const número = escolha ?? comTexto ?? entre ?? solta ?? "";
      const valor = opção ?? texto ?? valores.get(número) ?? "";

      valores.set(número, valor);

      return valor;
    },
  );
}
