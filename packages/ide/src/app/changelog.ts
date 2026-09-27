import changelogSource from "./changelog.gerado.md";

/**
 * Seções do `CHANGELOG.md` da raiz do repositório, embutido no build: funciona offline e não precisa de carregamento.
 * O `changelog.gerado.md` é gerado antes do `start` e do `release` (ver `package.json`), com uma seção `## BETA` a
 * mais para o que está em `changelog/` e ainda não chegou na main.
 */
const sections = changelogSource
  .split(/^(?=## )/m)
  .map(section => section.replace(/^## BETA$/m, "## Em teste na versão beta"));

export const CHANGELOG = sections.join("");

/**
 * A entrada mais recente (a primeira seção `## `), para a aba inicial.
 */
export const LATEST_CHANGELOG_ENTRY = sections.find(section => section.startsWith("## ")) ?? "";
