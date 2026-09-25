import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";
import { getSharedCodeIdFromHash, loadSharedCode } from "@/lib/share";

import { useWorkspaceActions } from "../workspaceActionsContext";

/**
 * Abre o código de um link `https://portugol.dev/#share=…` em uma aba nova.
 */
export function useSharedCodeLoader() {
  const { openEditor } = useWorkspaceActions();
  const handled = useRef(false);

  useEffect(() => {
    const shareId = getSharedCodeIdFromHash();

    if (!shareId || handled.current) {
      return;
    }

    handled.current = true;

    const toastId = toast.loading("Carregando código compartilhado…");

    void loadSharedCode(shareId).then(code => {
      toast.dismiss(toastId);

      if (code === null) {
        toast.error("Erro ao carregar código compartilhado", { duration: 10_000 });
        trackEvent("load_shared_code_error", "Interface", "Erro ao carregar código compartilhado");
        return;
      }

      // O código agora vive na área de trabalho: manter o `#share=` faria cada recarregamento
      // abrir uma cópia nova da mesma aba. A navegação para a aba nova já troca o endereço.
      openEditor(`Código compartilhado (#${shareId})`, code);
      trackEvent("load_shared_code_success", "Interface", "Código compartilhado carregado");
    });
  }, [openEditor]);
}
