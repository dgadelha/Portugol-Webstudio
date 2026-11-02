import { isMeaningfulDraft } from "./exercise-draft";
import { isMeaningfulCode, TabType } from "./workspace.types";

/**
 * Se o conteúdo de uma aba tem trabalho que se perderia: código que não é o de uma aba nova,
 * ou um rascunho de exercício com algo preenchido. As outras abas (Ajuda, novidades) não guardam
 * nada.
 */
export function hasMeaningfulContents(type: TabType, contents: string) {
  switch (type) {
    case "editor": {
      return isMeaningfulCode(contents);
    }

    case "exercise-builder": {
      return isMeaningfulDraft(contents);
    }

    default: {
      return false;
    }
  }
}
