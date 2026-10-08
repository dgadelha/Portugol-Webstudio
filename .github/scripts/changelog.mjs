// Cada mudança ainda não publicada fica num arquivo próprio em `changelog/`, e não direto no CHANGELOG.md: assim dois
// pull requests nunca editam o mesmo trecho e não entram em conflito. Os arquivos só viram seções do CHANGELOG.md no
// deploy.
//
//   node .github/scripts/changelog.mjs new       cria `changelog/<data e hora>.md` para o texto de uma mudança
//   node .github/scripts/changelog.mjs beta <arquivo>
//                                                grava em <arquivo> o CHANGELOG.md com as mudanças numa seção `## BETA`
//                                                no topo, para o build da IDE. Sem mudanças pendentes, como na main
//                                                depois do `release`, grava o CHANGELOG.md como está
//   node .github/scripts/changelog.mjs release   junta as mudanças numa seção com a data de hoje (horário de Brasília)
//                                                e apaga os arquivos. Se a seção do topo começou há até 7 dias, as
//                                                mudanças novas entram no topo dela, e o título vira um período que
//                                                termina hoje
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FILE = path.join(ROOT, "CHANGELOG.md");
const DIR = path.join(ROOT, "changelog");
const BETA_HEADING = "## BETA\n";
const SEPARATOR = "\n\n---\n\n";

// A aba inicial da IDE mostra só a seção do topo. Uma atualização grande fica nela por pelo menos este número de dias:
// o que for publicado nesse meio tempo entra na mesma seção, em vez de abrir uma nova que a esconderia
const DAYS_IN_TOP_SECTION = 7;

// `## 06/10/2026` ou `## 06/10/2026 – 08/10/2026`, com meia-risca. O hífen também é aceito, para um título editado à mão
const DATED_HEADING = /^## (\d{2})\/(\d{2})\/(\d{4})(?: [–-] \d{2}\/\d{2}\/\d{4})?\n/;

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
    .toSorted((a, b) => a.localeCompare(b))
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

function writeChangelog(sections, file = FILE) {
  writeFileSync(file, `${sections.join("").trimEnd()}\n`);
}

function pendingChanges() {
  const files = entryFiles();
  const { sections, legacyBeta } = readChangelog();
  const texts = [...files.map(file => entryText(file)), legacyBeta].filter(Boolean);

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
  console.log(`Created ${path.relative(process.cwd(), file)}`);
}

function beta(output) {
  if (!output) {
    throw new Error("Missing the output file");
  }

  const { sections, text, insertAt } = pendingChanges();

  if (text) {
    console.log(`Writing ${output} with the pending changelog entries in a BETA section`);
    sections.splice(insertAt, 0, `${BETA_HEADING}\n${text}\n\n`);
  } else {
    console.log(`Writing ${output} without pending changelog entries`);
  }

  writeChangelog(sections, output);
}

function release() {
  const { files, sections, text, insertAt } = pendingChanges();

  if (text) {
    const { year, month, day } = nowInBrasília();
    const today = `${day}/${month}/${year}`;
    const next = sections[insertAt];
    const heading = next?.match(DATED_HEADING);

    // As duas datas são de Brasília e sem hora, então a diferença é um número exato de dias
    const age = heading
      ? (Date.UTC(year, month - 1, day) - Date.UTC(heading[3], heading[2] - 1, heading[1])) / 86_400_000
      : -1;

    if (age === 0) {
      console.log(`Adding the pending changelog entries to the existing ## ${today} section`);
      sections[insertAt] = `${heading[0]}\n${text}${SEPARATOR}${next.slice(heading[0].length).trim()}\n\n`;
    } else if (age > 0 && age <= DAYS_IN_TOP_SECTION) {
      // O rótulo mostra a quem já leu a seção o que chegou depois. Num segundo deploy no mesmo dia, as mudanças entram
      // embaixo do rótulo que já existe
      const label = `**Novo em ${today}:**`;
      const body = next.slice(heading[0].length).trim();
      const rest = body.startsWith(label) ? body.slice(label.length).trim() : body;

      console.log(`Adding the pending changelog entries to the top of the ${heading[0].trim()} section`);
      sections[insertAt] =
        `## ${heading[1]}/${heading[2]}/${heading[3]} – ${today}\n\n${label}\n\n${text}${SEPARATOR}${rest}\n\n`;
    } else {
      console.log(`Adding the pending changelog entries to a new ## ${today} section`);
      sections.splice(insertAt, 0, `## ${today}\n\n${text}\n\n`);
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

if (command) {
  command(process.argv[3]);
} else {
  console.error(`Usage: node ${path.relative(process.cwd(), process.argv[1])} <${Object.keys(commands).join("|")}>`);
  process.exitCode = 1;
}
