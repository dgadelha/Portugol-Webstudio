import { useEffect } from "react";

import { useWorkspaceActions } from "@/features/workspace/workspaceActionsContext";

type PortugolWindow = Window & {
  portugol?: { abrirExemplo(contents: string, name: string): void };
};

/**
 * As páginas da Ajuda (no iframe) têm botões que abrem exemplos chamando `window.parent.portugol`.
 */
export function useHelpBridge() {
  const { openEditor } = useWorkspaceActions();

  useEffect(() => {
    const target = window as PortugolWindow;

    target.portugol = {
      abrirExemplo: (contents, name) => {
        openEditor(name, contents);
      },
    };

    return () => {
      delete target.portugol;
    };
  }, [openEditor]);
}
