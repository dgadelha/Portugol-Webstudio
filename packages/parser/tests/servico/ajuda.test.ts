import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { BIBLIOTECAS_IMPLEMENTADAS, constanteImplementada, funçãoImplementada, obterBiblioteca } from "../../src";
import { informaçãoEm } from "../helpers/cursor";

/**
 * Os arquivos dos tópicos escritos à mão, como os endereços `#ajuda=` os pedem.
 */
const TÓPICOS_DA_AJUDA = (() => {
  const arquivo = path.resolve(import.meta.dirname, "../../../resources/ajuda/topicos.json");
  const arquivos = new Set<string>();
  const visitar = (tópicos: Array<{ arquivo?: string; subtopicos?: unknown[] }>) => {
    for (const tópico of tópicos) {
      if (tópico.arquivo) {
        arquivos.add(tópico.arquivo);
      }

      visitar((tópico.subtopicos ?? []) as typeof tópicos);
    }
  };

  visitar(JSON.parse(readFileSync(arquivo, "utf8")));

  return arquivos;
})();

function membro(biblioteca: string, nome: string) {
  return informaçãoEm(
    `programa {\n  inclua biblioteca ${biblioteca}\n  funcao inicio() {\n    ${biblioteca}.${nome}▮\n  }\n}`,
  );
}

describe("o link da Ajuda na informação", () => {
  // A Ajuda gera as páginas das bibliotecas com o mesmo `páginaNaAjuda`; aqui, só se garante
  // que nenhuma função ou constante que o Webstudio executa fica sem o link.
  test.each([...BIBLIOTECAS_IMPLEMENTADAS])("cada função e constante da %s tem o link da Ajuda", nome => {
    const biblioteca = obterBiblioteca(nome)!;

    for (const função of biblioteca.funções) {
      if (funçãoImplementada(nome, função.nome)) {
        expect(membro(nome, função.nome)?.ajuda).toBe(`bibliotecas/${nome}/${função.nome}.md`);
      }
    }

    for (const constante of biblioteca.constantes) {
      if (constanteImplementada(nome, constante.nome)) {
        expect(membro(nome, constante.nome)?.ajuda).toBe(`bibliotecas/${nome}/${constante.nome}.md`);
      }
    }
  });

  test("a biblioteca aponta para a página dela", () => {
    expect(
      informaçãoEm("programa {\n  inclua biblioteca Matematica --> m▮at\n  funcao inicio() {\n  }\n}")?.ajuda,
    ).toBe("bibliotecas/Matematica.md");
  });

  test("a biblioteca que o Webstudio não executa não tem página na Ajuda", () => {
    const informação = informaçãoEm("programa {\n  inclua biblioteca Arq▮uivos\n  funcao inicio() {\n  }\n}");

    expect(informação).not.toBeNull();
    expect(informação?.ajuda).toBeUndefined();
  });

  test.each(["escreva", "leia", "limpa"])("%s aponta para a página dela em Entrada e Saída", nome => {
    const ajuda = informaçãoEm(`programa {\n  funcao inicio() {\n    ${nome}▮()\n  }\n}`)?.ajuda;

    expect(ajuda).toBe(`topicos/linguagem_portugol/entrada_saida/${nome}.md`);
    expect(TÓPICOS_DA_AJUDA).toContain(ajuda);
  });

  test.each([
    ["sorteia", "sorteia▮(1, 6)"],
    ["o que o programa declarou", "inteiro x▮ = 1"],
  ])("%s não tem página", (_, linha) => {
    expect(informaçãoEm(`programa {\n  funcao inicio() {\n    ${linha}\n  }\n}`)?.ajuda).toBeUndefined();
  });
});
