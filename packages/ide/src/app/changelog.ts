import changelogSource from "../../../../CHANGELOG.md";

/**
 * Seções do `CHANGELOG.md` da raiz do repositório, embutido no build: funciona offline e não precisa de carregamento.
 * A seção `## BETA` guarda o que ainda não chegou na main e fica vazia no resto do tempo, quando não aparece.
 */
const sections = changelogSource
  .split(/^(?=## )/m)
  .filter(section => !/^## BETA\s*$/.test(section))
  .map(section => section.replace(/^## BETA$/m, "## Em teste na versão beta"));

export const CHANGELOG = sections.join("");

/**
 * A entrada mais recente (a primeira seção `## `), para a aba inicial.
 */
export const LATEST_CHANGELOG_ENTRY = sections.find(section => section.startsWith("## ")) ?? "";
