import { type ReactNode, useMemo, useState } from "react";

import { AboutDialog } from "@/features/about/AboutDialog";
import { CommandPalette } from "@/features/commandPalette/CommandPalette";
import { OpenExampleDialog } from "@/features/examples/OpenExampleDialog";
import { SettingsDialog } from "@/features/settings/SettingsDialog";
import { useWorkspaceActions } from "@/features/workspace/workspaceActionsContext";
import { trackEvent } from "@/lib/analytics";

import { type AppDialogs, AppDialogsContext } from "./appDialogsContext";

type OpenDialog = "settings" | "about" | "examples" | "commands" | null;

/**
 * Diálogos globais do IDE, abertos pela sidebar, pela paleta de comandos ou pelo editor.
 */
export function AppDialogsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenDialog>(null);
  const { openEditor, openChangelog } = useWorkspaceActions();

  const dialogs = useMemo<AppDialogs>(() => {
    return {
      openSettings: () => {
        trackEvent("open_settings_modal", "Interface", "Abrir modal de configurações");
        setOpen("settings");
      },
      openAbout: () => {
        setOpen("about");
      },
      openExamples: () => {
        setOpen("examples");
      },
      openCommandPalette: () => {
        setOpen(current => (current === "commands" ? null : "commands"));
      },
    };
  }, []);

  const closeWhenHidden = (dialog: Exclude<OpenDialog, null>) => {
    return (isOpen: boolean) => {
      if (!isOpen) {
        setOpen(current => (current === dialog ? null : current));
      }
    };
  };

  return (
    <AppDialogsContext value={dialogs}>
      {children}

      <CommandPalette open={open === "commands"} onOpenChange={closeWhenHidden("commands")} />

      <SettingsDialog open={open === "settings"} onOpenChange={closeWhenHidden("settings")} />

      <AboutDialog
        open={open === "about"}
        onOpenChange={closeWhenHidden("about")}
        onOpenChangelog={() => {
          setOpen(null);
          openChangelog();
        }}
      />

      <OpenExampleDialog
        open={open === "examples"}
        onOpenChange={closeWhenHidden("examples")}
        onOpenExample={example => {
          trackEvent("open_example", "Diálogo de Exemplos", `Abrir exemplo: ${example.title}`);
          setOpen(null);
          openEditor(example.title, example.code);
        }}
      />
    </AppDialogsContext>
  );
}
