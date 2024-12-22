import fs from "node:fs/promises";
import path from "node:path";

import iconv from "iconv-lite";
import readdirp from "readdirp";

import { baseDir, baseHtmlPath } from "../config.js";

let _ajudaCss: string | null = null;

async function getAjudaCss() {
  if (_ajudaCss !== null) {
    return _ajudaCss;
  }

  const fileName = path.join(baseDir, "ajuda", "estilos", "ajuda.css");

  _ajudaCss = (await fs.readFile(fileName))
    .toString()
    .replaceAll("${cor_letra}", "cdcdcd")
    .replaceAll("${cor_destaque}", "3a464c")
    .replaceAll("${cor_letra_titulo}", "cdcdcd")
    .replaceAll("${fundo_escuro}", "121e24")
    .replaceAll("${fundo_medio}", "263238")
    .replaceAll("${cor_3}", "f0433b")
    .replaceAll("${valor_cadeia}", "FFC200")
    .replaceAll("${valor_inteiro}", "00F0C0")
    .replaceAll("${valor_logico}", "F1433C")
    .replaceAll("${palavras_reservadas}", "F1433C")
    .replaceAll("${operador}", "E8E2B7")
    .replaceAll("${tipos}", "45BEFF")
    .replaceAll("${comentario_linha}", "66747B");

  return _ajudaCss;
}

async function patchHtmlFile(data: Buffer) {
  console.log(`   [Base HTML Path]: ${baseHtmlPath}`);

  return data
    .toString("utf8")
    .replace(
      "<head>",
      "<head><meta charset='utf-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>",
    )
    .replace(
      "</head>",
      `<link href='${baseHtmlPath}/assets/fonts/pt-sans/400.css' rel='stylesheet'><link href='/assets/fonts/pt-sans/700.css' rel='stylesheet'><style type='text/css'>.dp-highlighter{pointer-events:initial !important}html,body{margin:0;padding:0;font-family:'PT Sans',sans-serif;font-size:15px}body{padding-bottom:25px}p{line-height:18pt}h1,h2{padding-left:15px;font-family:'PT Sans',sans-serif}h1{font-size:18pt;position:sticky;top:0}ul>li{margin-top:10px}ul>li:first-child{margin-top:0}</style></head>`,
    )
    .replaceAll(/(?:\.\.\/)+scripts\/exemplos\.js/gu, `${baseHtmlPath}/assets/exemplos.js`)
    .replaceAll(/(?:\.\.\/)+scripts\//gu, `${baseHtmlPath}/assets/recursos/ajuda/scripts/`)
    .replaceAll(/(?:\.\.\/)+estilos\//gu, `${baseHtmlPath}/assets/recursos/ajuda/estilos/`)
    .replaceAll(/(?:\.\.\/)+recursos\/imagens\//gu, `${baseHtmlPath}/assets/recursos/ajuda/recursos/imagens/`)
    .replaceAll(/(?:\.\.\/)+recursos\//gu, `${baseHtmlPath}/assets/recursos/ajuda/recursos/`)
    .replaceAll("topicos/linguagem_portugol/", `${baseHtmlPath}/assets/recursos/ajuda/topicos/linguagem_portugol/`)
    .replace("/*${css}*/", await getAjudaCss())
    .replace("${syntax}", "SyntaxHighlighter.css")
    .replace("SyntaxHighlighter.css/>", 'SyntaxHighlighter.css"/>')
    .replaceAll("${tema}", "Dark");
}

export async function patchHtmlFiles() {
  const topicosDir = path.join(baseDir, "ajuda", "topicos");

  for await (const file of readdirp(topicosDir, {
    type: "files",
    fileFilter: path => path.basename.endsWith(".html"),
  })) {
    console.log(`-> Ajustando ${file.path}`);
    const fileName = path.join(topicosDir, file.path);
    const data = await fs.readFile(fileName);

    await fs.writeFile(fileName, await patchHtmlFile(data));
  }
}

export async function patchPortugolFiles() {
  for await (const file of readdirp(baseDir, {
    type: "files",
    fileFilter: path => path.basename.endsWith(".por"),
  })) {
    console.log(`-> Ajustando ${file.path}`);
    const fileName = path.join(baseDir, file.path);
    let data = iconv.decode(await fs.readFile(fileName), "ISO-8859-1");

    const portugolSignaturePos = data.indexOf("/* $$$ Portugol Studio $$$ ");

    if (portugolSignaturePos !== -1) {
      data = data.slice(0, Math.max(0, portugolSignaturePos));
    }

    await fs.writeFile(fileName, data);
  }
}
