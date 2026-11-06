//
// Gera `packages/ide/src/monaco-pt-br.gerado.js`, as mensagens do Monaco Editor (menus, widgets,
// paleta de comandos, o que os leitores de tela ouvem) em português do Brasil.
//
// O Monaco traz o `vs/nls/lang/pt-br.js`, mas vazio: o build do VS Code procura a tradução em
// `vscode-language-pack-pt-br`, a pasta se chama `…-pt-BR`, e no Linux (que diferencia maiúsculas)
// o português é pulado sem aviso (microsoft/monaco-editor#5127). Este script roda o mesmo build
// do VS Code que o Monaco usa, no commit do Monaco instalado, com a correção de
// microsoft/vscode#345704, e confere o resultado: os outros idiomas têm de sair idênticos aos
// que o Monaco traz.
//
//   npm run monaco:pt-br -w @portugol-webstudio/ide
//
// Rode de novo depois de atualizar o Monaco (o teste do arquivo gerado falha até lá). Quando um
// Monaco trouxer o `pt-br.js` preenchido, apague este script e o arquivo gerado.
//
// Precisa de git, npm, internet e uns 2 GB livres na pasta temporária (apagada no fim). O VS
// Code pede a versão do Node do `.nvmrc` dele: se o Node atual não serve, usa (ou instala) essa
// versão pelo nvm. `MANTER=1` não apaga a pasta temporária.
//
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";

const RAIZ = path.resolve(import.meta.dirname, "../../../..");
const MONACO = path.join(RAIZ, "node_modules/monaco-editor");
const IDIOMAS_DO_MONACO = path.join(MONACO, "min/vs/nls/lang");
const DESTINO = path.join(RAIZ, "packages/ide/src/monaco-pt-br.gerado.js");

const CORREÇÃO = "microsoft/vscode#345704";
const MÁXIMO_DE_NULOS = 40;

// Os comandos do VS Code não herdam as variáveis `npm_*` do `npm run` que chamou este script
// (como o `-w`, que faria o `npm ci` procurar um workspace que lá não existe).
const AMBIENTE = Object.fromEntries(Object.entries(process.env).filter(([nome]) => !nome.startsWith("npm_")));

const { version: versãoDoMonaco, vscodeRef } = JSON.parse(readFileSync(path.join(MONACO, "package.json"), "utf8"));
const temporário = mkdtempSync(path.join(os.tmpdir(), "monaco-pt-br-"));
const vscode = path.join(temporário, "vscode");
const vscodeLoc = path.join(temporário, "vscode-loc");

try {
  etapa(`Monaco ${versãoDoMonaco}, VS Code ${vscodeRef}`);
  const commitDoCore = saída("npm", ["view", `monaco-editor-core@${versãoDoMonaco}`, "vscodeCommitId"]);
  if (commitDoCore !== vscodeRef) {
    throw new Error(`O monaco-editor-core ${versãoDoMonaco} veio do VS Code ${commitDoCore}, não do ${vscodeRef}.`);
  }

  etapa("Baixando o VS Code");
  executar("git", ["init", "-q", vscode]);
  executar("git", ["remote", "add", "origin", "https://github.com/microsoft/vscode.git"], vscode);
  executar("git", ["fetch", "-q", "--depth", "1", "origin", vscodeRef], vscode);
  executar("git", ["-c", "advice.detachedHead=false", "checkout", "-q", "FETCH_HEAD"], vscode);
  const correção = corrigirPortuguês();

  // O Monaco baixa o vscode-loc no `main` do momento em que publica o monaco-editor-core: o
  // commit certo é o último do `main` antes da publicação no npm.
  etapa("Baixando o vscode-loc");
  const publicação = JSON.parse(saída("npm", ["view", "monaco-editor-core", "time", "--json"]))[versãoDoMonaco];
  executar("git", [
    "clone",
    "-q",
    "--filter=blob:none",
    "--no-checkout",
    "https://github.com/microsoft/vscode-loc.git",
    vscodeLoc,
  ]);
  const commitDoLoc = saída(
    "git",
    ["rev-list", "-1", "--first-parent", `--before=${publicação}`, "origin/main"],
    vscodeLoc,
  );
  executar("git", ["-c", "advice.detachedHead=false", "checkout", "-q", commitDoLoc], vscodeLoc);
  console.log(`monaco-editor-core ${versãoDoMonaco} publicado em ${publicação}: vscode-loc ${commitDoLoc}`);

  etapa("Instalando as dependências do VS Code (sem scripts: nada de Electron nem módulos nativos)");
  const versãoDoNode = readFileSync(path.join(vscode, ".nvmrc"), "utf8").trim().replace(/^v/, "");
  const ambiente = { ...AMBIENTE, PATH: `${pastaDoNode(versãoDoNode)}${path.delimiter}${AMBIENTE.PATH}` };
  executar("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], vscode, ambiente);
  executar("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], path.join(vscode, "build"), ambiente);

  etapa("Compilando o editor (gulp editor-distro)");
  executar("npm", ["run", "gulp", "editor-distro"], vscode, ambiente);
  const saídaDoBuild = path.join(vscode, "out-monaco-editor-core/esm");

  // O Monaco copia o `nls.messages.<idioma>.js` do monaco-editor-core como `vs/nls/lang/<idioma>.js`,
  // sem mudar nada: fora o cabeçalho, os outros idiomas têm de sair iguais aos instalados.
  etapa("Conferindo os outros idiomas com os do Monaco instalado");
  const outros = readdirSync(IDIOMAS_DO_MONACO)
    .filter(arquivo => arquivo.endsWith(".js") && arquivo !== "pt-br.js")
    .map(arquivo => arquivo.replace(/\.js$/, ""));
  const diferentes = outros.filter(idioma => {
    const nossa = corpo(path.join(saídaDoBuild, `nls.messages.${idioma}.js`));
    return nossa !== corpo(path.join(IDIOMAS_DO_MONACO, `${idioma}.js`));
  });
  if (outros.length === 0 || diferentes.length > 0) {
    throw new Error(`Idiomas diferentes dos do Monaco: ${diferentes.join(", ") || "nenhum idioma encontrado"}.`);
  }
  console.log(`Iguais aos do Monaco: ${outros.join(", ")}`);

  etapa("Conferindo o português");
  const português = mensagens(path.join(saídaDoBuild, "nls.messages.pt-br.js"));
  const inglês = mensagens(path.join(saídaDoBuild, "nls.messages.js"))._VSCODE_NLS_MESSAGES;
  const doMonaco = mensagens(path.join(IDIOMAS_DO_MONACO, "pt-br.js"))._VSCODE_NLS_MESSAGES;
  const textos = português._VSCODE_NLS_MESSAGES;
  const nulos = textos.filter(texto => texto === null).length;
  const semOsMesmosMarcadores = textos.filter(
    (texto, i) => texto !== null && marcadores(texto) !== marcadores(inglês[i]),
  );
  console.log(`${textos.length} mensagens (o Monaco tem ${doMonaco.length}), ${nulos} sem tradução`);

  if (português._VSCODE_NLS_LANGUAGE !== "pt-br") {
    throw new Error(`O idioma saiu "${português._VSCODE_NLS_LANGUAGE}".`);
  }
  if (textos.length !== doMonaco.length || textos.length !== inglês.length) {
    throw new Error(
      `O Monaco tem ${doMonaco.length} mensagens e o build, ${textos.length} (${inglês.length} em inglês).`,
    );
  }
  if (nulos > MÁXIMO_DE_NULOS) {
    throw new Error(`${nulos} mensagens sem tradução (o limite é ${MÁXIMO_DE_NULOS}).`);
  }
  if (semOsMesmosMarcadores.length > 0) {
    throw new Error(`${semOsMesmosMarcadores.length} traduções sem os mesmos {0}, {1}… do inglês.`);
  }

  const traduzidasPeloMonaco = doMonaco.filter(texto => texto !== null).length;
  if (traduzidasPeloMonaco > 0) {
    console.warn(
      `O Monaco ${versãoDoMonaco} já traz ${traduzidasPeloMonaco} mensagens em português: apague este gerador.`,
    );
  }

  writeFileSync(DESTINO, cabeçalho(correção, commitDoLoc) + corpo(path.join(saídaDoBuild, "nls.messages.pt-br.js")));
  console.log(`\nGravado: ${path.relative(RAIZ, DESTINO)}`);
} finally {
  if (process.env.MANTER) {
    console.log(`Pasta temporária mantida: ${temporário}`);
  } else {
    rmSync(temporário, { recursive: true, force: true });
  }
}

/**
 * Faz o build do VS Code achar a tradução (a correção de microsoft/vscode#345704). Diz se a
 * correção foi aplicada aqui ou se o VS Code já a tinha.
 */
function corrigirPortuguês() {
  const arquivo = path.join(vscode, "build/lib/i18n.ts");
  const código = readFileSync(arquivo, "utf8");
  if (/\{ id: 'pt-br',[^}]*translationId: 'pt-BR'/.test(código)) {
    console.log(`O VS Code já tem a correção de ${CORREÇÃO}.`);
    return "já com a correção";
  }
  const antes = "{ id: 'pt-br', folderName: 'ptb' }";
  if (!código.includes(antes)) {
    throw new Error(`O build/lib/i18n.ts do VS Code não tem "${antes}": veja ${CORREÇÃO}.`);
  }
  writeFileSync(arquivo, código.replace(antes, "{ id: 'pt-br', folderName: 'ptb', translationId: 'pt-BR' }"));
  return `com ${CORREÇÃO}`;
}

/**
 * A pasta do Node que o VS Code pede: a do Node atual, se tem a mesma versão principal e não é
 * mais antigo (a regra do `build/npm/preinstall.ts` do VS Code), ou a do nvm.
 */
function pastaDoNode(versão) {
  const [principal, secundária, correção] = versão.split(".").map(Number);
  const [atual, atualSecundária, atualCorreção] = process.versions.node.split(".").map(Number);
  if (
    atual === principal &&
    (atualSecundária > secundária || (atualSecundária === secundária && atualCorreção >= correção))
  ) {
    return path.dirname(process.execPath);
  }

  const nvm = process.env.NVM_DIR ?? path.join(os.homedir(), ".nvm");
  const pasta = path.join(nvm, "versions/node", `v${versão}`, "bin");
  if (!existsSync(path.join(pasta, "node"))) {
    if (!existsSync(path.join(nvm, "nvm.sh"))) {
      throw new Error(
        `O VS Code pede o Node ${versão} (.nvmrc); este é o ${process.versions.node}, e o nvm não está instalado.`,
      );
    }
    executar("bash", ["-c", `source "${nvm}/nvm.sh" && nvm install ${versão}`]);
  }
  console.log(`Node ${versão} (do .nvmrc do VS Code)`);
  return pasta;
}

function cabeçalho(correção, commitDoLoc) {
  return `/*!-----------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Released under the MIT license
 * https://github.com/microsoft/vscode/blob/main/LICENSE.txt
 * https://github.com/microsoft/vscode-loc/blob/main/LICENSE.md
 *-----------------------------------------------------------*/

// ARQUIVO GERADO: não edite. Para gerar de novo (depois de atualizar o Monaco):
//   npm run monaco:pt-br -w @portugol-webstudio/ide
//
// As mensagens do Monaco Editor em português do Brasil, que o Monaco traz vazias
// (microsoft/monaco-editor#5127), feitas pelo build do próprio VS Code. Apague este arquivo e
// o gerador (packages/ide/scripts/monaco-pt-br) quando o Monaco trouxer o pt-br.js preenchido.
//
// monaco-editor: ${versãoDoMonaco}
// vscode: ${vscodeRef} (${correção})
// vscode-loc: ${commitDoLoc}

`;
}

// O arquivo de mensagens sem o cabeçalho: de `globalThis._VSCODE_NLS_MESSAGES=` até o fim.
function corpo(arquivo) {
  const texto = readFileSync(arquivo, "utf8");
  const início = texto.indexOf("globalThis._VSCODE_NLS_MESSAGES=");
  if (início === -1) {
    throw new Error(`${arquivo} não tem as mensagens.`);
  }
  return texto.slice(início);
}

// Roda o arquivo de mensagens e devolve o que ele põe no `globalThis`.
function mensagens(arquivo) {
  const global = {};
  global.globalThis = global;
  vm.runInNewContext(readFileSync(arquivo, "utf8"), global);
  return global;
}

// Os marcadores `{0}`, `{1}`… de um texto, em ordem, para comparar a tradução com o inglês.
function marcadores(texto) {
  return (texto.match(/\{\d+\}/g) ?? []).toSorted((a, b) => a.localeCompare(b)).join(",");
}

function etapa(texto) {
  console.log(`\n== ${texto}`);
}

function executar(comando, argumentos, cwd = temporário, env = AMBIENTE) {
  execFileSync(comando, argumentos, { cwd, env, stdio: "inherit" });
}

function saída(comando, argumentos, cwd = temporário) {
  return execFileSync(comando, argumentos, { cwd, env: AMBIENTE, encoding: "utf8" }).trim();
}
