import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";

import AdmZip from "adm-zip";
import * as rimraf from "rimraf";

import { baseDir } from "./config.js";
import { generateExamplesJson } from "./helpers/exemplos.js";
import { download, getETag } from "./helpers/internet.js";
import { patchHtmlFiles, patchPortugolFiles } from "./helpers/patch.js";

import "./ajuda.js";

export async function configurarRecursos() {
  const assetsPath = "Portugol-Studio-master/ide/src/main/assets/";
  const tempDir = path.join(baseDir, "..", "recursos.temp/");
  const psZip = path.join(baseDir, "..", "Portugol-Studio.zip");

  try {
    // Excluir o ZIP caso tenha havido uma interrupção durante o download anterior
    if (existsSync(psZip)) {
      await fs.unlink(psZip);
    }

    const fileUrl = "https://github.com/UNIVALI-LITE/Portugol-Studio/archive/master.zip";
    const remoteEtag = await getETag(fileUrl);
    const localEtag = path.join(baseDir, "etag");

    console.log("Remote ETag:", remoteEtag);

    if (existsSync(localEtag)) {
      const localETagContents = await fs.readFile(localEtag, "utf8");

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

    await download(fileUrl, psZip);

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
    await import(url.pathToFileURL(path.join(baseDir, "ajuda", "scripts", "topicos.js")).toString());

    console.log("Ajustando arquivos HTML...");
    await patchHtmlFiles();

    console.log("Ajustando arquivos POR...");
    await patchPortugolFiles();

    console.log("Gerando índice da seção Exemplos...");
    await fs.writeFile(
      path.join(baseDir, "exemplos", "index.json"),
      JSON.stringify(await generateExamplesJson(path.join(baseDir, "exemplos"), "")),
    );

    await fs.writeFile(localEtag, remoteEtag);

    console.log("Configuração de recursos concluída!");
  } catch (error) {
    console.error(
      `Falha ao baixar o código-fonte do Portugol Studio: ${error} - Reinicie o Portugol Webstudio para tentar novamente.`,
    );
    console.error(error);
  }
}

configurarRecursos().catch((error: unknown) => {
  console.error(error);
});
