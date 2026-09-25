import { createContext, useContext } from "react";

export interface TabRename {
  /**
   * Aba cujo título está sendo editado na barra de abas.
   */
  renamingTabId: string | null;
  /**
   * Encerra a edição: com um título, renomeia; com `null`, cancela.
   */
  finishRename: (title: string | null) => void;
}

export const TabRenameContext = createContext<TabRename | null>(null);

export function useTabRename() {
  const rename = useContext(TabRenameContext);

  if (!rename) {
    throw new Error("useTabRename precisa estar dentro de <WorkspaceActionsProvider>");
  }

  return rename;
}
