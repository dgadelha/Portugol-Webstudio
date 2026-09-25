import { type ChangeEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { trackEvent } from "@/lib/analytics";
import { readTextFile } from "@/lib/files";

import { ConfirmCloseTabDialog } from "./components/ConfirmCloseTabDialog";
import { pathForTab } from "./tabPaths";
import { type TabRename, TabRenameContext } from "./tabRenameContext";
import { isMeaningfulCode, type Tab } from "./types";
import { useWorkspaceStore } from "./useWorkspace";
import { type WorkspaceActions, WorkspaceActionsContext } from "./workspaceActionsContext";
import type { SingletonTabType } from "./workspaceStore";

const SINGLETON_EVENTS: Record<SingletonTabType, { open: [string, string]; select: [string, string] }> = {
  help: {
    open: ["help_tab_open", "Nova aba de ajuda"],
    select: ["help_tab_select", "Selecionar aba de ajuda já aberta"],
  },
  changelog: {
    open: ["changelog_tab_open", "Nova aba de novidades"],
    select: ["changelog_tab_select", "Selecionar aba de novidades já aberta"],
  },
};

/**
 * Operações de aba que envolvem navegação e diálogos. Fica dentro do router: mudar de aba é
 * mudar de rota.
 */
export function WorkspaceActionsProvider({ children }: { children: ReactNode }) {
  const store = useWorkspaceStore();
  const navigate = useNavigate();

  const [closing, setClosing] = useState<Tab | null>(null);
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { actions, closeNow } = useMemo(() => {
    const goToTab = (tab: Tab | null) => {
      void navigate(pathForTab(tab));
    };

    const closeNow = (tab: Tab) => {
      goToTab(store.closeTab(tab.id));
      trackEvent("close_tab", "Interface", "Fechar aba", store.getSnapshot().tabs.length);
    };

    const openSingleton = (type: SingletonTabType) => {
      const { tab, created } = store.upsertSingletonTab(type);
      const [action, label] = SINGLETON_EVENTS[type][created ? "open" : "select"];

      goToTab(tab);
      trackEvent(action, "Interface", label);
    };

    const actions: WorkspaceActions = {
      goToTab,

      openEditor(title, contents) {
        const tab = store.addTab(title, contents);

        goToTab(tab);

        return tab;
      },

      openFilesFromDisk() {
        fileInputRef.current?.click();
      },

      openHelp() {
        openSingleton("help");
      },

      openChangelog() {
        openSingleton("changelog");
      },

      requestCloseTab(tab) {
        // Só vale interromper quem tem algo a perder: aba de ajuda e aba intocada fecham direto.
        if (tab.type === "editor" && isMeaningfulCode(store.getContents(tab.id))) {
          setClosing(tab);
        } else {
          closeNow(tab);
        }
      },

      requestRenameTab(tab) {
        if (tab.type !== "editor") {
          return;
        }

        trackEvent("edit_tab_title", "Interface", "Editar título de aba");
        setRenamingTabId(tab.id);
      },
    };

    return { actions, closeNow };
  }, [navigate, store]);

  const rename = useMemo<TabRename>(
    () => ({
      renamingTabId,
      finishRename: title => {
        const trimmed = title?.trim();

        if (renamingTabId && trimmed) {
          store.renameTab(renamingTabId, trimmed);
        }

        setRenamingTabId(null);
      },
    }),
    [renamingTabId, store],
  );

  const onFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";

    if (files.length > 0) {
      trackEvent("open_file", "Interface", "Abrir arquivo", files.length);
    }

    for (const file of files) {
      actions.openEditor(file.name, await readTextFile(file));
    }
  };

  return (
    <WorkspaceActionsContext value={actions}>
      <TabRenameContext value={rename}>{children}</TabRenameContext>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept=".por,text/plain"
        onChange={event => void onFilesSelected(event)}
      />

      <ConfirmCloseTabDialog
        tab={closing}
        onCancel={() => {
          setClosing(null);
        }}
        onConfirm={tab => {
          setClosing(null);
          closeNow(tab);
        }}
      />

    </WorkspaceActionsContext>
  );
}
