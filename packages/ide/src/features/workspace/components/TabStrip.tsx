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

const TAB_ICONS: Record<TabType, LucideIcon> = {
  editor: FileCode2,
  help: CircleHelp,
  changelog: Newspaper,
};

/**
 * Cada aba é um botão separado, no estilo `outline` do shadcn; a ativa fica destacada com
 * `accent`. O botão é um link para a rota da aba.
 */
const tabClass = cn(
  "group/tab relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border bg-background pr-1 pl-3 text-sm font-medium whitespace-nowrap shadow-xs",
  "text-muted-foreground transition-[color,background-color,box-shadow] hover:bg-accent hover:text-accent-foreground",
  "dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
  "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
  "dark:data-[active=true]:bg-input/60",
  "has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
);

export function TabStrip() {
  const tabs = useTabs();
  const activeTabId = useActiveTabId();
  const { openEditor } = useWorkspaceActions();

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      {/* O espaço interno deixa o anel de foco caber: a rolagem horizontal recorta o que passa da borda. */}
      <nav
        aria-label="Abas abertas"
        className="-mx-1.5 flex min-w-0 items-center gap-1.5 overflow-x-auto px-1.5 py-2 [scrollbar-width:none]"
      >
        <Link
          to={PATHS.home}
          data-active={activeTabId === null}
          aria-current={activeTabId === null ? "page" : undefined}
          aria-label="Início"
          className={cn(tabClass, "w-8 justify-center px-0 outline-none")}
        >
          <House className="size-4" />
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
    <div data-active={active} className={cn(tabClass, renaming && "border-ring ring-[3px] ring-ring/50")}>
      {renaming ? (
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon className="size-4 shrink-0" />
          <TabTitleInput title={tab.title} />
        </span>
      ) : (
        <Link
          to={pathForTab(tab)}
          aria-current={active ? "page" : undefined}
          title={tab.type === "editor" ? "Clique duas vezes para renomear" : undefined}
          className="flex max-w-48 min-w-0 items-center gap-1.5 outline-none"
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
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{tab.title}</span>
        </Link>
      )}

      <button
        type="button"
        aria-label={`Fechar ${tab.title}`}
        className={cn(
          "flex size-6 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-background/80 hover:text-foreground focus-visible:opacity-100",
          !active && !renaming && "opacity-0 group-hover/tab:opacity-100",
        )}
        onClick={() => {
          requestCloseTab(tab);
        }}
      >
        <X className="size-3.5" />
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
      className="field-sizing-content max-w-48 min-w-[3ch] bg-transparent p-0 text-sm font-medium text-foreground caret-foreground outline-none selection:bg-primary/25"
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
