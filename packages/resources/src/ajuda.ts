import { writeFileSync } from "node:fs";
import { join } from "node:path";

import slugify from "slugify";

import { baseDir } from "./config.js";

interface PortugolAjudaItem {
  titulo: string;
  subTopicos?: PortugolAjudaItem[];
  html: string;
}

interface TreeItem {
  id: string;
  text: string;
  href?: string;
  children?: TreeItem[];
}

// @ts-ignore
global.Tree = {
  create(data: { data: PortugolAjudaItem[] }) {
    const items: TreeItem[] = [];

    function lerRecursivo(baseId: string, parent: PortugolAjudaItem[], out: TreeItem[]) {
      for (const obj of parent) {
        const jsTreeObj: TreeItem = {
          id: (baseId.length > 0 ? `${baseId}.` : baseId) + slugify(obj.titulo, { strict: true }),
          text: obj.titulo,
          href: obj.html,
        };

        if (obj.subTopicos && obj.subTopicos.length > 0) {
          jsTreeObj.children = [];
          lerRecursivo(jsTreeObj.id, obj.subTopicos, jsTreeObj.children);
        }

        out.push(jsTreeObj);
      }
    }

    lerRecursivo("", data.data, items);
    writeFileSync(join(baseDir, "ajuda", "scripts", "topicos.json"), JSON.stringify(items, null, 2));
  },
};
