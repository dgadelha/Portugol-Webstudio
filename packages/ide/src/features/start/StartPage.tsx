import { ArrowRight, BookOpen, FilePlus2, FolderOpen } from "lucide-react";
import { useState } from "react";

import { BrandLogo, seasonalLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { useAppDialogs } from "@/features/appDialogs/appDialogsContext";
import { useWorkspaceActions } from "@/features/workspace/workspaceActionsContext";
import { trackEvent } from "@/lib/analytics";
import { LATEST_CHANGELOG_TITLE } from "@/lib/changelog";

import { RecentSessions } from "./components/RecentSessions";
import { VersionFooter } from "./components/VersionFooter";

const CATEGORY = "Aba Inicial";

export function StartPage() {
  const [logo] = useState(() => seasonalLogo());
  const { openEditor, openFilesFromDisk, openChangelog } = useWorkspaceActions();
  const { openExamples } = useAppDialogs();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-12">
        <BrandLogo variant={logo} className="mx-auto mb-6 max-w-64" />

        <div className="grid gap-2">
          <Button
            type="button"
            size="lg"
            onClick={() => {
              openEditor();
              trackEvent("home_new_file", CATEGORY, "Novo arquivo");
            }}
          >
            <FilePlus2 />
            Novo arquivo
            <Kbd className="ml-auto bg-primary-foreground/15 text-primary-foreground">Ctrl N</Kbd>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                trackEvent("home_open_file", CATEGORY, "Abrir arquivo através da aba Inicial");
                openFilesFromDisk();
              }}
            >
              <FolderOpen />
              Abrir arquivo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                trackEvent("open_examples_dialog", CATEGORY, "Abrir diálogo de exemplos");
                openExamples();
              }}
            >
              <BookOpen />
              Exemplos
            </Button>
          </div>
        </div>

        <RecentSessions />

        <button
          type="button"
          className="group mx-auto flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            trackEvent("open_changelog", CATEGORY, "Ver histórico de atualizações");
            openChangelog();
          }}
        >
          <span className="font-medium text-foreground">Novidades</span>
          <span className="truncate">{LATEST_CHANGELOG_TITLE}</span>
          <ArrowRight className="size-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <VersionFooter />
    </div>
  );
}
