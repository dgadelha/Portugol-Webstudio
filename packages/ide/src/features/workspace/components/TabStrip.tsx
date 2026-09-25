import { CircleHelp, FileCode2, House, type LucideIcon, Newspaper, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";

import { IconButton } from "@/components/IconButton";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

import { PATHS, pathForTab } from "../tabPaths";
import type { Tab, TabType } from "../types";
import { useActiveTabId, useTabs } from "../useWorkspace";
import { useTabRename } from "../tabRenameContext";
import { useWorkspaceActions } from "../workspaceActionsContext";
import styles from "./TabStrip.module.css";

const TAB_ICONS: Record<TabType, LucideIcon> = {
  editor: FileCode2,
  help: CircleHelp,
  changelog: Newspaper,
};

/**
 * Cada aba é um botão separado, no estilo dos botões `outline`; a ativa fica destacada com
 * `accent`. O botão é um link para a rota da aba.
 */
export function TabStrip() {
  const tabs = useTabs();
  const activeTabId = useActiveTabId();
  const { openEditor } = useWorkspaceActions();

  return (
    <div className={styles.strip}>
      {/* O espaço interno deixa o anel de foco caber: a rolagem horizontal recorta o que passa da borda. */}
      <nav aria-label="Abas abertas" className={styles.tabs}>
        <Link
          to={PATHS.home}
          data-active={activeTabId === null}
          aria-current={activeTabId === null ? "page" : undefined}
          aria-label="Início"
          className={cn(styles.tab, styles.home)}
        >
          <House className={styles.homeIcon} />
        </Link>

        {tabs.map(tab => (
          <TabStripItem key={tab.id} tab={tab} active={tab.id === activeTabId} />
        ))}
      </nav>

      <IconButton
        label="Novo arquivo (Ctrl+N)"
        tooltipSide="bottom"
        variant="outline"
        size="icon-sm"
        icon={<Plus />}
        onClick={() => {
          openEditor();
          trackEvent("new_tab_top", "Editor", "Nova aba", tabs.length + 1);
        }}
      />
    </div>
  );
}

function TabStripItem({ tab, active }: { tab: Tab; active: boolean }) {
  const { requestCloseTab, requestRenameTab } = useWorkspaceActions();
  const { renamingTabId } = useTabRename();
  const Icon = TAB_ICONS[tab.type];
  const renaming = renamingTabId === tab.id;

  return (
    <div data-active={active} className={cn(styles.tab, renaming && styles.renaming)}>
      {renaming ? (
        <span className={styles.renameField}>
          <Icon className={styles.icon} />
          <TabTitleInput title={tab.title} />
        </span>
      ) : (
        <Link
          to={pathForTab(tab)}
          aria-current={active ? "page" : undefined}
          title={tab.type === "editor" ? "Clique duas vezes para renomear" : undefined}
          className={styles.link}
          onDoubleClick={() => {
            requestRenameTab(tab);
          }}
          onAuxClick={event => {
            // Botão do meio fecha a aba, como nos navegadores.
            if (event.button === 1) {
              event.preventDefault();
              requestCloseTab(tab);
            }
          }}
        >
          <Icon className={styles.icon} />
          <span className={styles.title}>{tab.title}</span>
        </Link>
      )}

      <button
        type="button"
        aria-label={`Fechar ${tab.title}`}
        className={cn(styles.close, !active && !renaming && styles.closeOnHover)}
        onClick={() => {
          requestCloseTab(tab);
        }}
      >
        <X className={styles.closeIcon} />
      </button>
    </div>
  );
}

/**
 * Título editável dentro da própria aba: Enter ou clicar fora salva, Esc cancela.
 */
function TabTitleInput({ title }: { title: string }) {
  const { finishRename } = useTabRename();
  const [value, setValue] = useState(title);
  // Enter e Esc já encerram a edição: o blur que vem quando o campo some não pode salvar de novo.
  const finished = useRef(false);

  const finish = (result: string | null) => {
    if (!finished.current) {
      finished.current = true;
      finishRename(result);
    }
  };

  return (
    <input
      aria-label="Novo nome da aba"
      autoFocus
      value={value}
      spellCheck={false}
      className={styles.titleInput}
      onFocus={event => {
        event.currentTarget.select();
      }}
      onChange={event => {
        setValue(event.target.value);
      }}
      onBlur={() => {
        finish(value);
      }}
      onKeyDown={event => {
        if (event.key === "Enter") {
          event.preventDefault();
          finish(value);
        } else if (event.key === "Escape") {
          event.preventDefault();
          finish(null);
        }
      }}
    />
  );
}
