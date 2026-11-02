import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { topicFolders } from "../helpers/exercicios";

// Os testes de cada exercício ficam num arquivo por tópico, em `topicos/`, para o CI dividir a
// conferência com o Portugol Studio entre os shards (veja `helpers/exercicios.ts`)
describe("Exercícios", () => {
  test("Há tópicos", () => {
    expect(topicFolders().length).toBeGreaterThan(0);
  });

  test.each(topicFolders())("O tópico %s tem o seu arquivo de teste", topic => {
    expect(existsSync(path.join(import.meta.dirname, "topicos", `${topic}.test.ts`))).toBe(true);
  });
});
