import { createContext, useContext } from "react";

/**
 * Área da sidebar que a aba ativa pode preencher. A aba de editor coloca ali as suas ações
 * (executar, salvar…) por um portal, sem tirar o estado de execução de dentro do editor.
 */
export const SidebarSlotContext = createContext<{
  slot: HTMLElement | null;
  setSlot: (element: HTMLElement | null) => void;
} | null>(null);

export function useSidebarSlot() {
  const context = useContext(SidebarSlotContext);

  if (!context) {
    throw new Error("useSidebarSlot precisa estar dentro de <WorkspaceLayout>");
  }

  return context;
}
