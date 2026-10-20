import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { createAuxiliaryTypeStore, createTypeAlias, printNode, zodToTs } from "zod-to-ts";
import { schema, tópicos } from "./schema.js";

const baseDirectory = path.join(import.meta.dirname, "..");
const ids = new Map();
const índice = [];

for (const [tópico, nome] of Object.entries(tópicos)) {
  const directory = path.join(baseDirectory, tópico);
  const arquivos = (await fs.readdir(directory).catch(() => []))
    .filter(arquivo => arquivo.endsWith(".json"))
    .toSorted((a, b) => a.localeCompare(b));
  const itens = [];

  for (const arquivo of arquivos) {
    const caminho = `${tópico}/${arquivo}`;
    const resultado = schema.safeParse(JSON.parse(await fs.readFile(path.join(directory, arquivo), "utf8")));

    if (!resultado.success) {
      throw new Error(`${caminho} não segue o esquema:\n${z.prettifyError(resultado.error)}`);
    }

    const exercício = resultado.data;
    const slug = arquivo.slice(0, -".json".length);

    if (exercício.id !== `pws:${slug}`) {
      throw new Error(`${caminho}: o id deveria ser "pws:${slug}", o nome do arquivo, mas é "${exercício.id}"`);
    }

    if (exercício.tópico !== tópico) {
      throw new Error(`${caminho}: o tópico deveria ser "${tópico}", a pasta, mas é "${exercício.tópico}"`);
    }

    // A solução de referência fica ao lado, num arquivo que não vai para o IDE: o JSON é
    // publicado como está, e quem o abrisse veria a resposta
    const solução = await fs.readFile(path.join(directory, `${slug}.solucao.por`), "utf8").catch(() => "");

    if (!solução.trim()) {
      throw new Error(`${caminho}: falta a solução de referência em ${tópico}/${slug}.solucao.por`);
    }

    if (ids.has(exercício.id)) {
      throw new Error(`${caminho}: o id "${exercício.id}" também é de ${ids.get(exercício.id)}`);
    }

    ids.set(exercício.id, caminho);
    itens.push({ id: exercício.id, título: exercício.título, dificuldade: exercício.dificuldade, arquivo: caminho });
  }

  if (itens.length > 0) {
    // Do mais fácil para o mais difícil; na mesma dificuldade, a ordem dos arquivos
    itens.sort((a, b) => a.dificuldade - b.dificuldade);
    índice.push({ tópico, nome, itens });
  }
}

await fs.writeFile(path.join(baseDirectory, "index.json"), JSON.stringify(índice, undefined, 2) + "\n");

const auxiliaryTypeStore = createAuxiliaryTypeStore();
const { node } = zodToTs(schema, { auxiliaryTypeStore });

await fs.writeFile(
  path.join(baseDirectory, "index.d.ts"),
  printNode(createTypeAlias(node, "Exercício")).replace(/^type /, "export type ") +
    `

export type ÍndiceDeExercícios = Array<{
  tópico: Exercício["tópico"];
  nome: string;
  itens: Array<{ id: string; título: string; dificuldade: Exercício["dificuldade"]; arquivo: string }>;
}>;
`,
);
