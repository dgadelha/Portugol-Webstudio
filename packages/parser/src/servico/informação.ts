import { assinaturaDaConstante, páginaNaAjuda } from "../bibliotecas/assinaturas.js";
import { bibliotecaImplementada } from "../bibliotecas/suporte.js";
import { chamávelDoPrograma } from "./chamáveis.js";
import { comentárioDe } from "./comentários.js";
import type { Intervalo, Posição } from "./contexto.js";
import { bloco, textoComLinks } from "./markdown.js";
import { resolverNome, type Significado } from "./resolução.js";
import { type CódigoLido, declaraçãoNoCódigo, type SímboloDeclarado } from "./símbolos.js";

export interface InformaçãoDoNome {
  /**
   * O nome sob o cursor: a informação fica aberta enquanto o mouse anda por ele.
   */
  intervalo: Intervalo;
  /**
   * Em Markdown: a declaração num bloco de código e, depois, o texto. Sem negrito nem
   * títulos, como na documentação das sugestões.
   */
  conteúdo: string;
  /**
   * A página da Ajuda sobre o nome, como nos endereços `#ajuda=`: as bibliotecas e o que elas
   * têm, e as funções da linguagem que têm uma página só delas.
   */
  ajuda?: string;
}

/**
 * O que o nome na posição é, como o VS Code mostra ao parar o mouse sobre ele.
 */
export function informaçãoDoNome(código: string, posição: Posição): InformaçãoDoNome | null {
  const resolvido = resolverNome(código, posição);

  if (!resolvido) {
    return null;
  }

  const { intervalo, significado, lido } = resolvido;
  const ajuda = páginaDaAjuda(significado);

  return { intervalo, conteúdo: conteúdo(significado, lido.tokens), ...(ajuda && { ajuda }) };
}

function páginaDaAjuda(significado: Significado) {
  switch (significado.tipo) {
    case "biblioteca": {
      // A Ajuda só tem as páginas das bibliotecas que o Webstudio executa.
      const { nome } = significado.biblioteca;

      return bibliotecaImplementada(nome) ? páginaNaAjuda(nome) : undefined;
    }

    case "função": {
      return significado.biblioteca === undefined
        ? significado.função.ajuda
        : páginaNaAjuda(significado.biblioteca, significado.função.nome);
    }

    case "constante": {
      return páginaNaAjuda(significado.biblioteca, significado.constante.nome);
    }

    case "símbolo": {
      return;
    }
  }
}

function conteúdo(significado: Significado, tokens: CódigoLido["tokens"]) {
  switch (significado.tipo) {
    case "símbolo": {
      const { símbolo } = significado;

      if (símbolo.classe === "função") {
        return juntar(bloco(chamávelDoPrograma(símbolo).assinatura), comentário(símbolo, tokens));
      }

      const valor = símbolo.valor === undefined ? "" : ` = ${símbolo.valor}`;

      return juntar(bloco(declaraçãoNoCódigo(símbolo) + valor), oQueÉ(símbolo), comentário(símbolo, tokens));
    }

    case "biblioteca": {
      const { incluída, biblioteca } = significado;
      const apelido = incluída.alias ? ` --> ${incluída.alias}` : "";

      return juntar(bloco(`inclua biblioteca ${biblioteca.nome}${apelido}`), biblioteca.descrição.trim());
    }

    case "função": {
      return juntar(bloco(significado.função.assinatura), significado.função.documentação);
    }

    case "constante": {
      const { constante } = significado;

      return juntar(bloco(assinaturaDaConstante(constante)), constante.descrição.trim());
    }
  }
}

function juntar(...partes: Array<string | undefined>) {
  return partes.filter(Boolean).join("\n\n");
}

/**
 * Em palavras, o que o bloco de código não diz: `variável local`, `constante global`,
 * `parâmetro por referência`.
 */
function oQueÉ(símbolo: SímboloDeclarado) {
  if (símbolo.origem === "parâmetro") {
    const dimensão = símbolo.dimensão ? ` ${símbolo.dimensão}` : "";

    return `parâmetro${dimensão}${símbolo.referência ? " por referência" : ""}`;
  }

  const classe = símbolo.constante
    ? símbolo.dimensão
      ? `${símbolo.dimensão} constante`
      : "constante"
    : símbolo.classe;

  return `${classe} ${símbolo.origem}`;
}

/**
 * O comentário é texto, e não Markdown: `a * b` ou `v[i]` aparecem como foram escritos, e
 * cada linha fica na sua. Os endereços continuam links.
 */
function comentário(símbolo: SímboloDeclarado, tokens: CódigoLido["tokens"]) {
  const texto = comentárioDe(símbolo, tokens);

  return texto
    ?.split("\n\n")
    .map(parágrafo => {
      return parágrafo
        .split("\n")
        .map(linha => textoComLinks(linha))
        .join("\\\n");
    })
    .join("\n\n");
}
