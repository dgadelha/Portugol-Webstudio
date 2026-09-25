import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { PATHS } from "../tabPaths";
import { useWorkspaceStore } from "../useWorkspace";

/**
 * `/editor/:tabId` — foca a aba de editor. Um endereço de uma aba que não existe mais (link
 * antigo, sessão de outra janela) volta para a aba inicial.
 */
export function EditorRoute() {
  const store = useWorkspaceStore();
  const navigate = useNavigate();
  const { tabId = "" } = useParams();

  // Só reage à troca de endereço: fechar a aba já navega para a vizinha por conta própria.
  useEffect(() => {
    if (store.getTab(tabId)?.type === "editor") {
      store.setActiveTab(tabId);
    } else {
      void navigate(PATHS.home, { replace: true });
    }
  }, [store, navigate, tabId]);

  return null;
}
