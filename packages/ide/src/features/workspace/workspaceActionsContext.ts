import { createContext, useContext } from "react";

import type { Tab } from "./types";

export interface WorkspaceActions {
  /**
   * Abre uma aba de editor nova (vazia, com o esqueleto de um programa, ou com o conteúdo dado).
   */
  openEditor: (title?: string, contents?: string) => Tab;
  /**
   * Abre o seletor de arquivos do sistema; cada arquivo escolhido vira uma aba.
   */
  openFilesFromDisk: () => void;
  openHelp: () => void;
  openChangelog: () => void;
  goToTab: (tab: Tab | null) => void;
  /**
   * Fecha a aba, pedindo confirmação quando há código que seria perdido.
   */
  requestCloseTab: (tab: Tab) => void;
  requestRenameTab: (tab: Tab) => void;
}

export const WorkspaceActionsContext = createContext<WorkspaceActions | null>(null);

export function useWorkspaceActions() {
  const actions = useContext(WorkspaceActionsContext);

  if (!actions) {
    throw new Error("useWorkspaceActions precisa estar dentro de <WorkspaceActionsProvider>");
  }

  return actions;
}
