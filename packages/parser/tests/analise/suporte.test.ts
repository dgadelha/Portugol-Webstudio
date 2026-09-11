import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { DESTINO, gerar, inspecionarRuntime } from "../../tools/suporte.mjs";

/**
 * `suporte.gerado.ts` grava um fato sobre dois insumos que mudam sozinhos:
 * `@portugol-recursos/bibliotecas` e `packages/runtime/src/libs`. Sem esta guarda, um bump
 * de dependência deixa o arquivo obsoleto em silêncio — e a falha é na direção insegura:
 * o checker passaria a aceitar uma função de biblioteca que o runtime não executa.
 */
describe("suporte.gerado.ts", () => {
  test("está atualizado em relação ao recursos e ao runtime", async () => {
    const esperado: string = gerar(await inspecionarRuntime());

    expect(readFileSync(DESTINO, "utf8")).toBe(esperado);
  });
});
