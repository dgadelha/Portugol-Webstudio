// Troca o título `## BETA` do CHANGELOG.md pela data de hoje (horário de Brasília). Se já existe uma seção com a
// data de hoje logo abaixo, as duas viram uma só: o conteúdo do beta primeiro, separado por `---`. Depois, uma seção
// `## BETA` vazia volta para o topo, pronta para as próximas mudanças.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "CHANGELOG.md";
const BETA_HEADING = "## BETA\n";

const today = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}).format(new Date());

const todayHeading = `## ${today}\n`;
const sections = readFileSync(FILE, "utf8").split(/^(?=## )/m);
const betaIndex = sections.findIndex(section => section.startsWith(BETA_HEADING));

const beta = betaIndex === -1 ? undefined : sections[betaIndex].slice(BETA_HEADING.length).trim();
const next = sections[betaIndex + 1];

if (beta) {
  if (next?.startsWith(todayHeading)) {
    console.log(`Merging the BETA section into the existing ${today} section`);
    sections.splice(betaIndex, 2, `${todayHeading}\n${beta}\n\n---\n\n${next.slice(todayHeading.length).trim()}\n\n`);
  } else {
    console.log(`Dating the BETA section as ${today}`);
    sections[betaIndex] = `${todayHeading}\n${beta}\n\n`;
  }

  sections.splice(betaIndex, 0, `${BETA_HEADING}\n`);

  writeFileSync(FILE, `${sections.join("").trimEnd()}\n`);
} else {
  console.log("No BETA changes in CHANGELOG.md, nothing to date");
}
