import { bibliotecas } from "@portugol-recursos/bibliotecas";
import { BIBLIOTECAS_IMPLEMENTADAS } from "@portugol-webstudio/parser";

import type { HelpTopic } from "./types";

type Biblioteca = (typeof bibliotecas)[number];
type Funcao = Biblioteca["funções"][number];
type Constante = Biblioteca["constantes"][number];
type Tipo = Funcao["retorno"]["tipo"];

const dimensãoMap = {
  vetor: "[]",
  matriz: "[][]",
};

function typeSource(tipo: Tipo, name: string, kind: "func" | "const" | "param") {
  let source = `<span class="code-keyword">${tipo.primitivo}</span>`;

  if (tipo.dimensão) {
    const brackets = `<span class="code-keyword-brackets">${dimensãoMap[tipo.dimensão]}</span>`;

    if (kind === "param") {
      source += ` <span class="code-param-name">&${name}</span>${brackets}`;
    } else if (kind === "func") {
      source += `${brackets} <span class="code-func-name">${name}</span>`;
    } else {
      source += ` <span class="code-${kind}-name">${name}</span>${brackets}`;
    }
  } else {
    source += ` <span class="code-${kind}-name">${name}</span>`;
  }

  return source;
}

function referenceLink(url?: string) {
  return url ? `<a href="${url}" rel="external noopener noreferrer" target="_blank">Referência</a>` : "";
}

function dedent(source: string) {
  return source
    .split("\n")
    .map(line => line.trim())
    .join("\n");
}

function constantSource(constante: Constante) {
  return dedent(`
    <div class="code">
      ${typeSource(constante.tipo, constante.nome, "const")} = <span class="code-value">${constante.valor}</span>
    </div>

    ${constante.descrição ? `**Descrição:** ${constante.descrição}` : ""}

    ${referenceLink(constante.referência)}
  `);
}

function functionSource(func: Funcao) {
  const params = func.parâmetros.map(p => typeSource(p.tipo, p.nome, "param")).join(", ");
  const paramDocs = func.parâmetros.map(p => `\n  - \`${p.nome}\`: ${p.descrição}`).join("");

  return dedent(`
    <div class="code">
      <span class="code-keyword">funcao</span> ${typeSource(func.retorno.tipo, func.nome, "func")}(${params})
    </div>

    ${func.descrição ? `**Descrição:** ${func.descrição}` : ""}

    ${func.parâmetros.length > 0 ? `**Parâmetros:**${paramDocs}` : ""}

    ${func.retorno.descrição ? `**Retorna:** ${func.retorno.descrição}` : ""}

    ${referenceLink(func.referência)}
  `);
}

const implemented = new Set<string>(BIBLIOTECAS_IMPLEMENTADAS);

/**
 * Documentação das bibliotecas disponíveis no Webstudio, gerada a partir dos metadados do
 * Portugol Studio. Fica junto dos tópicos em HTML da Ajuda.
 */
export const librariesTopic: HelpTopic = {
  id: "libs",
  text: "Bibliotecas",
  kind: "markdown",
  source: "Selecione um item na árvore à esquerda para visualizar sua documentação",
  children: bibliotecas
    .filter(lib => implemented.has(lib.nome))
    .map(lib => {
      const header = `# Biblioteca ${lib.nome}\n\n`;

      return {
        id: lib.nome,
        text: lib.nome,
        kind: "markdown",
        source: `${header}**Descrição:** ${lib.descrição}`,
        children: [
          ...lib.constantes.map<HelpTopic>(constante => ({
            id: `${lib.nome}_${constante.nome}`,
            text: constante.nome,
            kind: "markdown",
            source: header + constantSource(constante),
          })),
          ...lib.funções.map<HelpTopic>(funcao => ({
            id: `${lib.nome}_${funcao.nome}`,
            text: funcao.nome,
            kind: "markdown",
            source: header + functionSource(funcao),
          })),
        ],
      };
    }),
};
