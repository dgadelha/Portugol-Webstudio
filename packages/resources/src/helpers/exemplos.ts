import fs from "node:fs/promises";
import path from "node:path";

import ini from "ini";

const ignoredExamples = [
  /[/\\]bibliotecas[/\\](sons|graficos|mouse|teclado|internet)$/g,
  /[/\\]bibliotecas[/\\](calendario|arquivos)$/g,
  /jogos$/g,
  /musica$/g,
];

export async function generateExamplesJson(baseDir: string, dir: string) {
  const indexDir = path.join(baseDir, dir);

  console.log(`-> Obtendo exemplos de ${indexDir}`);

  const indexProperties = path.join(indexDir, "index.properties");
  const parsedProperties = ini.decode(await fs.readFile(indexProperties, "utf8"));
  const keys = Object.keys(parsedProperties);
  const items: Array<Record<string, string>> = [];

  for (let i = 0; i < parsedProperties.items; i++) {
    const item = keys
      .filter(key => key.startsWith(`item${i}`))
      .reduce<Record<string, any>>((acc, cur) => {
        acc[cur.slice(Math.max(0, cur.indexOf(".") + 1))] = parsedProperties[cur];
        return acc;
      }, {});

    if (item.type === "dir" && ignoredExamples.some(regex => regex.test(path.join(baseDir, dir, item.dir)))) {
      continue;
    }

    item.id = `${dir}/${item.dir ?? item.file}`;

    if (item.type === "dir") {
      item.children = await generateExamplesJson(baseDir, path.join(dir, item.dir));
    }

    item.file &&= path.join(baseDir, dir, item.file).slice(Math.max(0, baseDir.length + 1));

    items.push(item);
  }

  return items;
}
