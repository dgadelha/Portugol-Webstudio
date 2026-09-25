import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";

import { useWorkspaceStore } from "../useWorkspace";

/**
 * Avisa, uma vez por carregamento, se o código foi recuperado de uma sessão anterior ou se o
 * navegador não deixa salvar nada.
 */
export function useSessionNotices() {
  const store = useWorkspaceStore();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) {
      return;
    }

    shown.current = true;

    const { restoredFromPreviousSession, tabs } = store.getSnapshot();

    if (restoredFromPreviousSession) {
      toast.success("Recuperamos o código que você estava editando.", { duration: 8000 });
      trackEvent("workspace_restored", "Interface", "Código recuperado de uma sessão anterior", tabs.length);
    } else if (!store.persistenceAvailable) {
      toast.warning(
        "Seu navegador não está salvando o código automaticamente. Baixe o arquivo antes de fechar a aba.",
        { duration: 15_000 },
      );
      trackEvent("workspace_storage_unavailable", "Interface", "Não foi possível salvar o código no navegador");
    }
  }, [store]);
}
