import {
  BookOpen,
  CircleHelp,
  FileCode2,
  FilePlus2,
  FolderOpen,
  Lightbulb,
  MessageCircleQuestion,
  MoreHorizontal,
  Newspaper,
  PencilLine,
  Settings,
  X,
} from "lucide-react";
import { Link } from "react-router";

import { BrandMark } from "@/components/BrandMark";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { IS_BETA, LINKS } from "@/config/env";
import { useAppDialogs } from "@/features/appDialogs/appDialogsContext";
import { trackEvent } from "@/lib/analytics";

import { PATHS, pathForTab } from "../tabPaths";
import { useSidebarSlot } from "../sidebarSlotContext";
import { useActiveTabId, useTabs, useWorkspace } from "../useWorkspace";
import { useWorkspaceActions } from "../workspaceActionsContext";
import styles from "./AppSidebar.module.css";

/**
 * Sidebar contextual: numa aba de editor, mostra as ações do arquivo (o próprio editor as
 * coloca no slot); nas outras abas, a navegação do IDE.
 */
export function AppSidebar() {
  const editorActive = useWorkspace(state => state.tabs.find(tab => tab.id === state.activeTabId)?.type === "editor");
  const { setSlot } = useSidebarSlot();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Início">
              <Link to={PATHS.home}>
                <span className={styles.brandIcon}>
                  <BrandMark className={styles.brandMark} />
                </span>
                <span className={styles.brandText}>
                  <span className={styles.brandName}>Portugol Webstudio</span>
                  <span className={styles.brandTagline}>IDE online de Portugol</span>
                </span>
                {IS_BETA && (
                  <Badge variant="secondary" className={styles.beta}>
                    Beta
                  </Badge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {editorActive ? (
          <div ref={setSlot} className={styles.slot} />
        ) : (
          <>
            <StartGroup />
            <OpenFilesGroup />
            <ResourcesGroup />
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <FooterMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

function StartGroup() {
  const { openEditor, openFilesFromDisk } = useWorkspaceActions();
  const { openExamples } = useAppDialogs();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Começar</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Novo arquivo"
            onClick={() => {
              openEditor();
              trackEvent("new_tab_sidebar", "Interface", "Novo arquivo pela barra lateral");
            }}
          >
            <FilePlus2 />
            <span>Novo arquivo</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Abrir arquivo" onClick={openFilesFromDisk}>
            <FolderOpen />
            <span>Abrir arquivo</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Exemplos"
            onClick={() => {
              trackEvent("open_examples_dialog", "Interface", "Abrir diálogo de exemplos");
              openExamples();
            }}
          >
            <BookOpen />
            <span>Exemplos</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

function OpenFilesGroup() {
  const tabs = useTabs();
  const activeTabId = useActiveTabId();
  const { requestCloseTab, requestRenameTab } = useWorkspaceActions();
  const editors = tabs.filter(tab => tab.type === "editor");

  return (
    <SidebarGroup className={styles.openFiles}>
      <SidebarGroupLabel>Arquivos abertos</SidebarGroupLabel>
      <SidebarMenu>
        {editors.length === 0 && <p className={styles.empty}>Nenhum arquivo aberto.</p>}

        {editors.map(tab => (
          <SidebarMenuItem key={tab.id}>
            <SidebarMenuButton asChild isActive={tab.id === activeTabId}>
              <Link to={pathForTab(tab)}>
                <FileCode2 />
                <span>{tab.title}</span>
              </Link>
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction aria-label={`Ações de ${tab.title}`}>
                  <MoreHorizontal />
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className={styles.fileMenu}>
                <DropdownMenuItem
                  onSelect={() => {
                    requestRenameTab(tab);
                  }}
                >
                  <PencilLine />
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    requestCloseTab(tab);
                  }}
                >
                  <X />
                  Fechar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function ResourcesGroup() {
  const { openChangelog } = useWorkspaceActions();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recursos</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Novidades" onClick={openChangelog}>
            <Newspaper />
            <span>Novidades</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Sugestões">
            <a
              href={LINKS.suggestions}
              target="_blank"
              rel="external noreferrer noopener nofollow"
              onClick={() => {
                trackEvent("suggest_features", "Interface", "Enviar sugestões");
              }}
            >
              <Lightbulb />
              <span>Sugestões</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Dúvidas e perguntas">
            <a
              href={LINKS.questions}
              target="_blank"
              rel="external noreferrer noopener nofollow"
              onClick={() => {
                trackEvent("ask_questions", "Interface", "Enviar dúvidas");
              }}
            >
              <MessageCircleQuestion />
              <span>Dúvidas e perguntas</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

function FooterMenu() {
  const { openSettings } = useAppDialogs();
  const { openHelp } = useWorkspaceActions();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Configurações" onClick={openSettings}>
          <Settings />
          <span>Configurações</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Ajuda (F1)" onClick={openHelp}>
          <CircleHelp />
          <span>Ajuda</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
