// Cada mudança ainda não publicada fica num arquivo próprio em `changelog/`, e não direto no CHANGELOG.md: assim dois
// pull requests nunca editam o mesmo trecho e não entram em conflito. Os arquivos só viram seções do CHANGELOG.md no
// deploy.
//
//   node .github/scripts/changelog.mjs new       cria `changelog/<data e hora>.md` para o texto de uma mudança
//   node .github/scripts/changelog.mjs beta      coloca as mudanças numa seção `## BETA` no topo, para o build do beta
//                                                (sem commit: os arquivos continuam em `changelog/`)
//   node .github/scripts/changelog.mjs release   junta as mudanças numa seção com a data de hoje (horário de Brasília)
//                                                e apaga os arquivos. Se já existe uma seção com a data de hoje, as
//                                                mudanças novas entram no topo dela
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const FILE = "CHANGELOG.md";
const DIR = "changelog";
const BETA_HEADING = "## BETA\n";
const SEPARATOR = "\n\n---\n\n";

const TEMPLATE = `<!--
Escreva a mudança pensando em quem usa a IDE (estudantes e professores), sem jargão técnico.
Se quiser, termine com o seu usuário do GitHub e o link do PR, como nas outras entradas:
"Contribuição de [@usuario](https://github.com/usuario). [Mais detalhes](link do PR)"
Este comentário não aparece no CHANGELOG.md.
-->

`;

function nowInBrasília() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

// Os nomes gerados pelo `new` começam pela data e hora, então a ordem inversa dos nomes deixa as mais recentes primeiro
function entryFiles() {
  if (!existsSync(DIR)) {
    return [];
  }

  return readdirSync(DIR)
    .filter(name => name.endsWith(".md") && name !== "README.md")
    .toSorted()
    .toReversed()
    .map(name => path.join(DIR, name));
}

function entryText(file) {
  return readFileSync(file, "utf8")
    .replaceAll(/<!--[\s\S]*?-->/g, "")
    .trim();
}

// Uma seção `## BETA` escrita direto no CHANGELOG.md, do jeito antigo, entra depois das mudanças em `changelog/`
function readChangelog() {
  const sections = readFileSync(FILE, "utf8").split(/^(?=## )/m);
  const betaIndex = sections.findIndex(section => section.startsWith(BETA_HEADING));
  let legacyBeta = "";

  if (betaIndex !== -1) {
    legacyBeta = sections[betaIndex].slice(BETA_HEADING.length).trim();
    sections.splice(betaIndex, 1);
  }

  return { sections, legacyBeta };
}

function writeChangelog(sections) {
  writeFileSync(FILE, `${sections.join("").trimEnd()}\n`);
}

function pendingChanges() {
  const files = entryFiles();
  const { sections, legacyBeta } = readChangelog();
  const texts = [...files.map(entryText), legacyBeta].filter(Boolean);

  // O primeiro pedaço é o que vem antes de qualquer seção: o comentário e a introdução
  const firstSectionIndex = sections.findIndex(section => section.startsWith("## "));

  return {
    files,
    sections,
    text: texts.join(SEPARATOR),
    insertAt: firstSectionIndex === -1 ? sections.length : firstSectionIndex,
  };
}

function newEntry() {
  const { year, month, day, hour, minute, second } = nowInBrasília();
  const file = path.join(DIR, `${year}-${month}-${day}-${hour}-${minute}-${second}.md`);

  if (existsSync(file)) {
    throw new Error(`${file} already exists, try again in a second`);
  }

  mkdirSync(DIR, { recursive: true });
  writeFileSync(file, TEMPLATE);
  console.log(`Created ${file}`);
}

function beta() {
  const { sections, text, insertAt } = pendingChanges();

  if (!text) {
    console.log("No pending changelog entries");
    return;
  }

  console.log("Adding the pending changelog entries to a BETA section");
  sections.splice(insertAt, 0, `${BETA_HEADING}\n${text}\n\n`);
  writeChangelog(sections);
}

function release() {
  const { files, sections, text, insertAt } = pendingChanges();

  if (text) {
    const { year, month, day } = nowInBrasília();
    const todayHeading = `## ${day}/${month}/${year}\n`;
    const next = sections[insertAt];

    if (next?.startsWith(todayHeading)) {
      console.log(`Adding the pending changelog entries to the existing ${todayHeading.trim()} section`);
      sections[insertAt] = `${todayHeading}\n${text}${SEPARATOR}${next.slice(todayHeading.length).trim()}\n\n`;
    } else {
      console.log(`Adding the pending changelog entries to a new ${todayHeading.trim()} section`);
      sections.splice(insertAt, 0, `${todayHeading}\n${text}\n\n`);
    }

    writeChangelog(sections);
  } else {
    console.log("No pending changelog entries");
  }

  // Um arquivo vazio não entra no CHANGELOG.md, mas também não deve ficar para o próximo deploy
  for (const file of files) {
    rmSync(file);
  }
}

const commands = { new: newEntry, beta, release };
const command = commands[process.argv[2]];

if (!command) {
  console.error(`Usage: node ${path.relative(process.cwd(), process.argv[1])} <${Object.keys(commands).join("|")}>`);
  process.exit(1);
}

command();
