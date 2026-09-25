import {
  Download,
  FileDown,
  FileText,
  FolderOpen,
  Loader2,
  Play,
  Save,
  SaveAll,
  Share2,
  Square,
  SquareArrowOutUpRight,
} from "lucide-react";

import { BrandMark } from "@/components/BrandMark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { hasSaveFilePicker } from "@/lib/files";

import styles from "./EditorSidebarActions.module.css";

interface EditorSidebarActionsProps {
  running: boolean;
  transpiling: boolean;
  sharing: boolean;
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onSaveWithPicker: () => void;
  onDownload: (compat: boolean) => void;
  onOpenInNewTab: (as: "text" | "binary") => void;
  onOpenFile: () => void;
  onShare: () => void;
}

/**
 * Ações do arquivo aberto, mostradas na sidebar enquanto a aba de editor está em foco.
 */
export function EditorSidebarActions(props: EditorSidebarActionsProps) {
  const busy = props.running || props.transpiling;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Execução</SidebarGroupLabel>
        <SidebarMenu className={styles.runMenu}>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Executar (Ctrl+Enter)" disabled={busy} onClick={props.onRun}>
              <Play className={cn(!busy && styles.filled)} />
              <span>Executar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Parar" disabled={!busy} onClick={props.onStop}>
              {props.transpiling ? <Loader2 className="spin" /> : <Square className={cn(busy && styles.filled)} />}
              <span>Parar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Arquivo</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Salvar (Ctrl+S)" onClick={props.onSave}>
              <Save />
              <span>Salvar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SaveAsMenu {...props} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Abrir arquivo (Ctrl+O)" onClick={props.onOpenFile}>
              <FolderOpen />
              <span>Abrir arquivo</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Compartilhar" disabled={props.sharing} onClick={props.onShare}>
              {props.sharing ? <Loader2 className="spin" /> : <Share2 />}
              <span>Compartilhar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

function SaveAsMenu({ onSaveWithPicker, onDownload, onOpenInNewTab }: EditorSidebarActionsProps) {
  const track = (action: string, label: string) => {
    trackEvent(action, "Editor", `Botão de Salvar como - Ação ${label}`);
  };

  return (
    <DropdownMenu
      onOpenChange={open => {
        if (open) trackEvent("editor_save_as", "Editor", "Botão de Salvar como");
      }}
    >
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton tooltip="Salvar como…">
          <SaveAll />
          <span>Salvar como…</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start" className={styles.saveAsMenu}>
        <DropdownMenuLabel>Salvar como</DropdownMenuLabel>

        {hasSaveFilePicker && (
          <DropdownMenuItem
            onSelect={() => {
              track("editor_save_as_file_picker", "Escolher um arquivo");
              onSaveWithPicker();
            }}
          >
            <FileDown />
            Escolher onde salvar…
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onSelect={() => {
            track("editor_save_as_download", "Download");
            onDownload(false);
          }}
        >
          <Download />
          Baixar arquivo .por
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            track("editor_save_as_download_portugol_studio", "Download para Portugol Studio");
            onDownload(true);
          }}
        >
          <BrandMark className={styles.brandMark} />
          Baixar para o Portugol Studio
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => {
            track("editor_save_as_text", "Nova aba como texto");
            onOpenInNewTab("text");
          }}
        >
          <FileText />
          Abrir como texto em nova aba
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            track("editor_save_as_binary", "Nova aba como binário");
            onOpenInNewTab("binary");
          }}
        >
          <SquareArrowOutUpRight />
          Abrir como binário em nova aba
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
