import type { Tab } from "./types";

export const PATHS = {
  home: "/",
  help: "/ajuda",
  changelog: "/novidades",
  editor: (tabId: string) => `/editor/${tabId}`,
};

/**
 * Cada aba tem um endereço: as de editor pelo id, ajuda e novidades por nome (são únicas).
 */
export function pathForTab(tab: Tab | null) {
  if (!tab) {
    return PATHS.home;
  }

  switch (tab.type) {
    case "editor": {
      return PATHS.editor(tab.id);
    }

    case "help": {
      return PATHS.help;
    }

    case "changelog": {
      return PATHS.changelog;
    }
  }
}
