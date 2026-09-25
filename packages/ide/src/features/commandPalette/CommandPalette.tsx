import {
  BookOpen,
  CircleHelp,
  FileCode2,
  FilePlus2,
  FolderOpen,
  House,
  Info,
  Monitor,
  Moon,
  Newspaper,
  Settings,
  Sun,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/Command";
import { useAppDialogs } from "@/features/appDialogs/appDialogsContext";
import { settingsStore, type ThemePreference } from "@/features/settings/settingsStore";
import { useTabs } from "@/features/workspace/useWorkspace";
import { useWorkspaceActions } from "@/features/workspace/workspaceActionsContext";
import { trackEvent } from "@/lib/analytics";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const THEMES: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Tema claro", icon: Sun },
  { value: "dark", label: "Tema escuro", icon: Moon },
  { value: "auto", label: "Tema do sistema", icon: Monitor },
];

/**
 * Ctrl+K: todas as ações do IDE e a troca rápida entre abas, com busca.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const tabs = useTabs();
  const workspace = useWorkspaceActions();
  const dialogs = useAppDialogs();

  /**
   * Fecha a paleta antes de agir: a ação pode abrir outro diálogo.
   */
  const run = (action: () => void, label: string) => {
    return () => {
      onOpenChange(false);
      trackEvent("command_palette", "Interface", label);
      action();
    };
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Digite uma ação ou o nome de uma aba…" />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>

        <CommandGroup heading="Arquivos">
          <CommandItem onSelect={run(() => workspace.openEditor(), "Novo arquivo")}>
            <FilePlus2 />
            Novo arquivo
            <CommandShortcut>Ctrl N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(workspace.openFilesFromDisk, "Abrir arquivo")}>
            <FolderOpen />
            Abrir arquivo…
            <CommandShortcut>Ctrl O</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(dialogs.openExamples, "Exemplos")}>
            <BookOpen />
            Abrir exemplo…
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Ir para">
          <CommandItem
            value="Início"
            onSelect={run(() => {
              workspace.goToTab(null);
            }, "Início")}
          >
            <House />
            Início
          </CommandItem>
          {tabs
            .filter(tab => tab.type === "editor")
            .map(tab => (
              <CommandItem
                key={tab.id}
                value={`aba ${tab.title} ${tab.id}`}
                onSelect={run(() => {
                  workspace.goToTab(tab);
                }, "Trocar de aba")}
              >
                <FileCode2 />
                {tab.title}
              </CommandItem>
            ))}
          <CommandItem onSelect={run(workspace.openHelp, "Ajuda")}>
            <CircleHelp />
            Ajuda
            <CommandShortcut>F1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(workspace.openChangelog, "Novidades")}>
            <Newspaper />
            Novidades
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Preferências">
          {THEMES.map(theme => (
            <CommandItem
              key={theme.value}
              onSelect={run(() => {
                settingsStore.set("theme", theme.value);
              }, theme.label)}
            >
              <theme.icon />
              {theme.label}
            </CommandItem>
          ))}
          <CommandItem onSelect={run(dialogs.openSettings, "Configurações")}>
            <Settings />
            Configurações
          </CommandItem>
          <CommandItem onSelect={run(dialogs.openAbout, "Sobre")}>
            <Info />
            Sobre o Portugol Webstudio
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
