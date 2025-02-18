import { bibliotecas } from "@portugol-recursos/bibliotecas";
import { TreeItem } from "./types";

const dimensãoMap = {
  vetor: "[]",
  matriz: "[][]",
};

function getTypeSource(
  tipo: (typeof bibliotecas)[0]["funções"][0]["retorno"]["tipo"],
  name: string,
  kind: "func" | "const" | "param",
) {
  let ret = `<span class="code-keyword">${tipo.primitivo}</span>`;

  if (tipo.dimensão) {
    if (kind === "param") {
      ret += ` <span class="code-param-name">&${name}</span>`;
    } else if (kind === "func") {
      ret += `<span class="code-keyword-brackets">${dimensãoMap[tipo.dimensão]}</span>`;
      ret += ` <span class="code-func-name">${name}</span>`;
    } else {
      ret += ` <span class="code-${kind}-name">${name}</span>`;
    }

    if (kind !== "func") {
      ret += `<span class="code-keyword-brackets">${dimensãoMap[tipo.dimensão]}</span>`;
    }
  } else {
    ret += ` <span class="code-${kind}-name">${name}</span>`;
  }

  return ret;
}

function getConstantSource(constante: (typeof bibliotecas)[0]["constantes"][0]) {
  return `
    <div class="code">
      ${getTypeSource(constante.tipo, constante.nome, "const")} = <span class="code-value">${constante.valor}</span>
    </div>

    ${constante.descrição ? `**Descrição:** ${constante.descrição}` : ""}

    ${constante.referência ? `<a href="${constante.referência}" rel="external noopener noreferrer" target="_blank">Referência</a>` : ""}
  `
    .split("\n")
    .map(l => l.trim())
    .join("\n");
}

function getFunctionSource(func: (typeof bibliotecas)[0]["funções"][0]) {
  return `
    <div class="code">
      <span class="code-keyword">funcao</span> ${getTypeSource(func.retorno.tipo, func.nome, "func")}(${func.parâmetros
        .map(p => getTypeSource(p.tipo, p.nome, "param"))
        .join(", ")})
    </div>

    ${func.descrição ? `**Descrição:** ${func.descrição}` : ""}

    ${func.parâmetros.length > 0 ? `**Parâmetros:**` + func.parâmetros.map(p => "\n  - `" + p.nome + "`: " + p.descrição).join("") : ""}

    ${func.retorno.descrição ? `**Retorna:** ${func.retorno.descrição}` : ""}

    ${func.referência ? `<a href="${func.referência}" rel="external noopener noreferrer" target="_blank">Referência</a>` : ""}
  `
    .split("\n")
    .map(l => l.trim())
    .join("\n");
}

const bibliotecasWebstudio = new Set(["Calendario", "Graficos", "Matematica", "Texto", "Tipos", "Util"]);

// Código temporário até a Ajuda inteira ser em markdown também
export const libsTree: TreeItem = {
  id: "libs",
  text: "Bibliotecas",
  kind: "markdown",
  source: "Selecione um item na árvore à esquerda para visualizar sua documentação",
  children: bibliotecas
    .filter(lib => bibliotecasWebstudio.has(lib.nome))
    .map(lib => ({
      id: lib.nome,
      text: lib.nome,
      kind: "markdown",
      source: `# Biblioteca ${lib.nome}\n\n` + `**Descrição:** ${lib.descrição}`,
      children: lib.constantes
        .map<TreeItem>(constante => ({
          id: `${lib.nome}_${constante.nome}`,
          text: constante.nome,
          kind: "markdown",
          source: `# Biblioteca ${lib.nome}\n\n` + getConstantSource(constante),
        }))
        .concat(
          lib.funções.map<TreeItem>(função => ({
            id: `${lib.nome}_${função.nome}`,
            text: função.nome,
            kind: "markdown",
            source: `# Biblioteca ${lib.nome}\n\n` + getFunctionSource(função),
          })),
        ),
    })),
};
