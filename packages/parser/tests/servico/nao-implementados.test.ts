import { describe, expect, test, vi } from "vitest";

import { assinaturaEm, completarEm, rótulos } from "../helpers/cursor";

// Hoje o runtime executa tudo das bibliotecas que ele tem: aqui, a Matematica perde uma
// função e uma constante.
vi.mock("../../src/bibliotecas/suporte.gerado", async importOriginal => {
  const original = await importOriginal<typeof import("../../src/bibliotecas/suporte.gerado")>();

  return {
    ...original,
    SÍMBOLOS_NÃO_IMPLEMENTADOS: {
      ...original.SÍMBOLOS_NÃO_IMPLEMENTADOS,
      Matematica: { funções: ["potencia"], constantes: ["PI"] },
    },
  };
});

describe("símbolos que o Webstudio não executa", () => {
  test("ficam de fora da lista, como o analisador os recusa", () => {
    const itens = completarEm(
      "programa {\n  inclua biblioteca Matematica\n  funcao inicio() {\n    Matematica.▮\n  }\n}",
    );

    expect(rótulos(itens)).toContain("raiz");
    expect(rótulos(itens)).not.toContain("potencia");
    expect(rótulos(itens)).not.toContain("PI");
  });

  test("e sem ajuda de assinatura", () => {
    expect(
      assinaturaEm(
        "programa {\n  inclua biblioteca Matematica\n  funcao inicio() {\n    Matematica.potencia(▮\n  }\n}",
      ),
    ).toBeNull();
  });
});
