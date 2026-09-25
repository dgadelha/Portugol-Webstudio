import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router";

import { Separator } from "@/components/ui/Separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/Sidebar";
import { useAppDialogs } from "@/features/appDialogs/appDialogsContext";
import { AppDialogsProvider } from "@/features/appDialogs/AppDialogsProvider";
import { useHotkeys } from "@/hooks/useHotkeys";
import { trackEvent } from "@/lib/analytics";

import { AppSidebar } from "./components/AppSidebar";
import { SidebarSlotContext } from "./sidebarSlotContext";
import { TabPanels } from "./components/TabPanels";
import { TabStrip } from "./components/TabStrip";
import { useSessionNotices } from "./hooks/useSessionNotices";
import { useSharedCodeLoader } from "./hooks/useSharedCodeLoader";
import { useWorkspaceStore } from "./useWorkspace";
import { WorkspaceActionsProvider } from "./WorkspaceActionsProvider";
import { useWorkspaceActions } from "./workspaceActionsContext";
import styles from "./WorkspaceLayout.module.css";

/**
 * Rota raiz: sidebar, abas e painéis. As rotas filhas não desenham nada; elas só dizem qual
 * aba está em foco (ver `routes/`).
 */
export function WorkspaceLayout() {
  const store = useWorkspaceStore();
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const sidebarSlot = useMemo(() => ({ slot, setSlot }), [slot]);

  // Heartbeat e gravação ao fechar a janela.
  useEffect(() => store.start(), [store]);

  return (
    <WorkspaceActionsProvider>
      <AppDialogsProvider>
        <SidebarSlotContext value={sidebarSlot}>
          <SidebarProvider defaultOpen={false} className={styles.provider}>
            <AppSidebar />
            <SidebarInset className={styles.inset}>
              <Workspace />
            </SidebarInset>
          </SidebarProvider>
        </SidebarSlotContext>
        <Outlet />
      </AppDialogsProvider>
    </WorkspaceActionsProvider>
  );
}

function Workspace() {
  const store = useWorkspaceStore();
  const { openEditor, requestCloseTab, openFilesFromDisk } = useWorkspaceActions();
  const { openCommandPalette } = useAppDialogs();

  useSessionNotices();
  useSharedCodeLoader();

  useHotkeys({
    "mod+k": openCommandPalette,
    "mod+o": openFilesFromDisk,
    "mod+q": () => {
      const { activeTabId } = store.getSnapshot();
      const tab = activeTabId ? store.getTab(activeTabId) : null;

      if (tab) requestCloseTab(tab);
    },
    "mod+n": () => {
      openEditor();
      trackEvent("new_tab_top", "Editor", "Nova aba", store.getSnapshot().tabs.length);
    },
  });

  return (
    <>
      <header className={styles.header}>
        <SidebarTrigger className={styles.trigger} />
        <Separator orientation="vertical" className={styles.separator} />
        <TabStrip />
      </header>

      <TabPanels />
    </>
  );
}
