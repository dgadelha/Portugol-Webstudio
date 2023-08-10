import fs from "node:fs/promises";
import { join } from "node:path";

import iconv from "iconv-lite";
import readdirp from "readdirp";

import { baseDir, baseHtmlPath } from "../config.js";

let _ajudaCss: string | null = null;

async function getAjudaCss() {
  if (_ajudaCss !== null) {
    return _ajudaCss;
  }

  const fileName = join(baseDir, "ajuda", "estilos", "ajuda.css");

  _ajudaCss = (await fs.readFile(fileName))
    .toString()
    .replace(/\$\{cor_letra\}/gu, "cdcdcd")
    .replace(/\$\{cor_destaque\}/gu, "3a464c")
    .replace(/\$\{cor_letra_titulo\}/gu, "cdcdcd")
    .replace(/\$\{fundo_escuro\}/gu, "121e24")
    .replace(/\$\{fundo_medio\}/gu, "263238")
    .replace(/\$\{cor_3\}/gu, "f0433b")
    .replace(/\$\{valor_cadeia\}/gu, "FFC200")
    .replace(/\$\{valor_inteiro\}/gu, "00F0C0")
    .replace(/\$\{valor_logico\}/gu, "F1433C")
    .replace(/\$\{palavras_reservadas\}/gu, "F1433C")
    .replace(/\$\{operador\}/gu, "E8E2B7")
    .replace(/\$\{tipos\}/gu, "45BEFF")
    .replace(/\$\{comentario_linha\}/gu, "66747B");

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
      "<link href='https://fonts.googleapis.com/css?family=PT+Sans' rel='stylesheet'><style type='text/css'>.dp-highlighter{pointer-events:initial !important}html,body{margin:0;padding:0;font-family:'PT Sans',sans-serif;font-size:15px}body{padding-bottom:25px}p{line-height:18pt}h1,h2{padding-left:15px;font-family:'PT Sans',sans-serif}h1{font-size:18pt}ul>li{margin-top:10px}ul>li:first-child{margin-top:0}</style></head>",
    )
    .replace(/(?:\.\.\/)+scripts\/exemplos\.js/gu, `${baseHtmlPath}/assets/exemplos.js`)
    .replace(/(?:\.\.\/)+scripts\//gu, `${baseHtmlPath}/assets/recursos/ajuda/scripts/`)
    .replace(/(?:\.\.\/)+estilos\//gu, `${baseHtmlPath}/assets/recursos/ajuda/estilos/`)
    .replace(/(?:\.\.\/)+recursos\/imagens\//gu, `${baseHtmlPath}/assets/recursos/ajuda/recursos/imagens/`)
    .replace(/(?:\.\.\/)+recursos\//gu, `${baseHtmlPath}/assets/recursos/ajuda/recursos/`)
    .replace(/topicos\/linguagem_portugol\//gu, `${baseHtmlPath}/assets/recursos/ajuda/topicos/linguagem_portugol/`)
    .replace("/*${css}*/", await getAjudaCss())
    .replace("${syntax}", "SyntaxHighlighter.css")
    .replace("SyntaxHighlighter.css/>", 'SyntaxHighlighter.css"/>')
    .replace(/\$\{tema\}/gu, "Dark");
}

export async function patchHtmlFiles() {
  const topicosDir = join(baseDir, "ajuda", "topicos");

  for await (const file of readdirp(topicosDir, {
    type: "files",
    fileFilter: "*.html",
  })) {
    console.log(`-> Ajustando ${file.path}`);
    const fileName = join(topicosDir, file.path);
    const data = await fs.readFile(fileName);

    await fs.writeFile(fileName, await patchHtmlFile(data));
  }
}

export async function patchPortugolFiles() {
  for await (const file of readdirp(baseDir, {
    type: "files",
    fileFilter: "*.por",
  })) {
    console.log(`-> Ajustando ${file.path}`);
    const fileName = join(baseDir, file.path);
    let data = iconv.decode(await fs.readFile(fileName), "ISO-8859-1");

    const portugolSignaturePos = data.indexOf("/* $$$ Portugol Studio $$$ ");

    if (portugolSignaturePos > -1) {
      data = data.substring(0, portugolSignaturePos);
    }

    await fs.writeFile(fileName, data);
  }
}
