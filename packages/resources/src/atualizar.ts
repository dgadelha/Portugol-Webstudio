import { existsSync, promises as fs } from "node:fs";
import { join } from "node:path";

import AdmZip from "adm-zip";
import * as rimraf from "rimraf";

import { baseDir } from "./config.js";
import { generateExamplesJson } from "./helpers/exemplos.js";
import { download, getETag } from "./helpers/internet.js";
import { patchHtmlFiles, patchPortugolFiles } from "./helpers/patch.js";

import "./ajuda.js";

export async function configurarRecursos() {
  const assetsPath = "Portugol-Studio-master/ide/src/main/assets/";
  const tempDir = join(baseDir, "..", "recursos.temp/");
  const psZip = join(baseDir, "..", "Portugol-Studio.zip");

  try {
    // Excluir o ZIP caso tenha havido uma interrupção durante o download anterior
    if (existsSync(psZip)) {
      await fs.unlink(psZip);
    }

    const url = "https://github.com/UNIVALI-LITE/Portugol-Studio/archive/master.zip";
    const remoteEtag = await getETag(url);
    const localEtag = join(baseDir, ".etag");

    console.log("Remote ETag:", remoteEtag);

    if (existsSync(localEtag)) {
      const localETagContents = await fs.readFile(localEtag, "utf-8");

      console.log("Local ETag:", localETagContents);

      if (localETagContents === remoteEtag) {
        console.log("Recursos de ajuda já estão atualizados.");
        return;
      }
    }

    // Excluir o diretório de recursos caso exista
    if (existsSync(baseDir)) {
      rimraf.sync(baseDir);
    }

    await download(url, psZip);

    console.log("Download concluído, extraindo os recursos de ajuda...");

    const zip = new AdmZip(psZip);

    console.log(`Extraindo [Portugol-Studio.zip]/${assetsPath} para ${tempDir}...`);
    zip.extractEntryTo(assetsPath, tempDir, true, true);

    console.log(`Refazendo estrutura do diretório...`);
    await fs.rename(tempDir + assetsPath, baseDir);

    console.log("Removendo arquivos temporários...");
    rimraf.sync(tempDir);
    await fs.unlink(psZip);

    console.log("Gerando índice da aba Ajuda...");
    // @ts-ignore
    await import(join(baseDir, "ajuda", "scripts", "topicos.js"));
    // require(join(baseDir, "ajuda", "scripts", "topicos"));

    console.log("Ajustando arquivos HTML...");
    await patchHtmlFiles();

    console.log("Ajustando arquivos POR...");
    await patchPortugolFiles();

    console.log("Gerando índice da seção Exemplos...");
    await fs.writeFile(
      join(baseDir, "exemplos", "index.json"),
      JSON.stringify(await generateExamplesJson(join(baseDir, "exemplos"), "")),
    );

    await fs.writeFile(localEtag, remoteEtag);

    console.log("Configuração de recursos concluída!");
  } catch (err) {
    console.error(
      `Falha ao baixar o código-fonte do Portugol Studio: ${err} - Reinicie o Portugol Webstudio para tentar novamente.`,
    );
    console.error(err);
  }
}

configurarRecursos().catch(console.error);
