import AdmZip from "adm-zip";
import axios from "axios";
import { createWriteStream, existsSync, readFileSync, renameSync, rmdirSync, unlinkSync, writeFileSync } from "fs";
import { parse } from "ini";
import { join } from "path";
import { Stream } from "stream";

async function download(url: string, dest: string) {
  const file = createWriteStream(dest, { flags: "wx" });

  try {
    const res = await axios.get<Stream>(url, { responseType: "stream" });

    if (res.status === 200) {
      await new Promise((resolve, reject) => {
        res.data.pipe(file).once("error", reject).once("close", resolve);
      });
    } else {
      file.close();
      unlinkSync(dest); // Delete temp file
      throw `Server responded with ${res.status}`;
    }
  } catch (e) {
    file.close();
    unlinkSync(dest); // Delete temp file

    throw e;
  }
}

interface PortugolAjudaItem {
  titulo: string;
  subTopicos?: PortugolAjudaItem[];
  html: string;
}

interface JsTreeItem {
  text: string;
  icon?: string;
  li_attr?: Record<string, string>;
  children?: JsTreeItem[];
  state?: {
    selected: boolean;
    opened: boolean;
  };
}

// @ts-ignore
global.Tree = {
  create(data: { data: PortugolAjudaItem[] }) {
    const jsTreeConfig = {
      core: {
        themes: {
          name: "default-dark",
          dots: true,
          icons: true,
        },

        data: [] as JsTreeItem[],
      },

      types: {
        default: {
          icon: "icone icone-def",
        },
      },

      plugins: ["changed", "types", "wholerow"],
    };

    function lerRecursivo(parent: PortugolAjudaItem[], out: JsTreeItem[]) {
      for (const obj of parent) {
        const jsTreeObj: JsTreeItem = {
          text: obj.titulo,

          li_attr: {
            "data-html": obj.html,
          },
        };

        if (obj.subTopicos && obj.subTopicos.length > 0) {
          jsTreeObj.icon = "icone icone-lib";
          jsTreeObj.children = [];

          lerRecursivo(obj.subTopicos, jsTreeObj.children);
        }

        out.push(jsTreeObj);
      }
    }

    lerRecursivo(data.data, jsTreeConfig.core.data);

    jsTreeConfig.core.data[0].state = {
      selected: true,
      opened: true,
    };

    writeFileSync(
      join(__dirname, "public", "recursos", "ajuda", "scripts", "topicos.json"),
      JSON.stringify(jsTreeConfig),
    );
  },
};

function gerarIndiceExemplos(raiz: string) {
  const excluidos = ["Jogos", "Música", "Arquivos", "Graficos", "Calendario", "Internet"];
  const jsTreeConfig = {
    core: {
      themes: {
        name: "default-dark",
        dots: true,
        icons: true,
      },

      data: [],
    },

    plugins: ["changed", "types", "wholerow"],
  };

  function lerRecursivo(parent: string, out: JsTreeItem[]) {
    const indice: Record<string, string> = parse(readFileSync(join(parent, "index.properties")).toString());
    const itens = parseInt(indice.items, 10);

    for (let i = 0; i < itens; i++) {
      if (excluidos.includes(indice[`item${i}.name`])) {
        continue;
      }

      const type = indice[`item${i}.type`];
      const obj: JsTreeItem = {
        text: indice[`item${i}.name`],
      };

      if (type === "file") {
        obj.icon = "icone icone-exemplo";
        obj.li_attr = {
          "data-description": indice[`item${i}.description`],
          "data-file": join(parent, indice[`item${i}.file`]).substring(__dirname.length + 8 /* /public/ */),
        };
      } else if (type === "dir") {
        obj.icon = "icone icone-pasta";
        obj.children = [];

        lerRecursivo(join(parent, indice[`item${i}.dir`]), obj.children);
      }

      out.push(obj);
    }
  }

  lerRecursivo(raiz, jsTreeConfig.core.data);
  writeFileSync(join(raiz, "index.json"), JSON.stringify(jsTreeConfig));
}

export default async (callback: () => void) => {
  const assetsPath = "Portugol-Studio-master/ide/src/main/assets/";
  const recursos = join(__dirname, "public", "recursos/");
  const recursosTemp = join(__dirname, "public", "recursos.temp/");
  const psZip = join(__dirname, "public", "Portugol-Studio.zip");

  // Excluir o ZIP caso tenha havido uma interrupção durante o download anterior
  if (existsSync(psZip)) {
    unlinkSync(psZip);
  }

  if (existsSync(recursos)) {
    console.log(
      "O diretório Recursos foi encontrado! Caso queira atualizar os recursos basta excluir o seguinte diretório:",
    );

    console.log(`-> ${recursos}`);
    callback();
  } else {
    console.log("O diretório de recursos não foi encontrado!");
    console.log("Baixando a versão mais recente do código-fonte do Portugol Studio...");

    try {
      await download("https://github.com/UNIVALI-LITE/Portugol-Studio/archive/master.zip", psZip);

      console.log("Download concluído, extraindo os recursos de ajuda...");

      const zip = new AdmZip(psZip);

      console.log(`Extraindo [Portugol-Studio.zip]/${assetsPath} para ${recursosTemp}...`);
      zip.extractEntryTo(assetsPath, recursosTemp, true, true);

      console.log(`Refazendo estrutura do diretório...`);
      renameSync(recursosTemp + assetsPath, recursos);

      console.log("Removendo arquivos temporários...");
      rmdirSync(join(recursosTemp, "Portugol-Studio-master", "ide", "src", "main"));
      rmdirSync(join(recursosTemp, "Portugol-Studio-master", "ide", "src"));
      rmdirSync(join(recursosTemp, "Portugol-Studio-master", "ide"));
      rmdirSync(join(recursosTemp, "Portugol-Studio-master"));
      rmdirSync(recursosTemp);
      unlinkSync(psZip);

      console.log("Gerando índice da aba Ajuda...");
      // eslint-disable-next-line
      require("./public/recursos/ajuda/scripts/topicos");

      console.log("Gerando índice da seção Exemplos...");
      gerarIndiceExemplos(join(recursos, "exemplos/"));

      console.log("Configuração de recursos concluída!");
      callback();
    } catch (err) {
      console.error(
        `Falha ao baixar o código-fonte do Portugol Studio: ${err} - Reinicie o Portugol Webstudio para tentar novamente.`,
      );

      callback();
    }
  }
};
