import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import { createAuxiliaryTypeStore, createTypeAlias, printNode, zodToTs } from "zod-to-ts";
import { schema } from "./schema.js";

const baseDirectory = path.join(import.meta.dirname, "..");
const generatedFiles = new Set(["bibliotecas.yml", "bibliotecas.json", "index.d.ts"]);

const allFiles = await fs.readdir(baseDirectory);
const libraryFiles = allFiles.filter(
  file => file.startsWith("bibliotecas.") && file.endsWith(".yml") && !generatedFiles.has(file),
);

/**
 * @type {import('zod').z.infer<typeof schema>}
 */
let mergedLibs = {
  $schema: "./bibliotecas.schema.json",
  bibliotecas: [],
};

for (const libraryFile of libraryFiles) {
  const fileData = await fs.readFile(path.join(baseDirectory, libraryFile), "utf8");
  const libraryData = schema.parse(yaml.parse(fileData));

  mergedLibs.bibliotecas.push(...libraryData.bibliotecas);
}

for (const library of mergedLibs.bibliotecas) {
  library.constantes.sort((a, b) => a.nome.localeCompare(b.nome));
  library.funções.sort((a, b) => a.nome.localeCompare(b.nome));
}

await fs.writeFile(
  path.join(baseDirectory, "bibliotecas.yml"),
  "# yaml-language-server: $schema=./bibliotecas.schema.json\n" + yaml.stringify(mergedLibs),
);

await fs.writeFile(path.join(baseDirectory, "bibliotecas.json"), JSON.stringify(mergedLibs, undefined, 2) + "\n");

const identifier = "Schema";
const auxiliaryTypeStore = createAuxiliaryTypeStore();
const { node } = zodToTs(schema, { auxiliaryTypeStore });
const typeAlias = createTypeAlias(node, identifier);
const nodeString = printNode(typeAlias);

await fs.writeFile(
  path.join(baseDirectory, "index.d.ts"),
  nodeString + `\n\nexport const bibliotecas: ${identifier}["bibliotecas"];\n`,
);
