import { ArrowRight, BookOpen, FilePlus2, FolderOpen } from "lucide-react";
import { useState } from "react";

import { BrandLogo, seasonalLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { useAppDialogs } from "@/features/appDialogs/appDialogsContext";
import { useWorkspaceActions } from "@/features/workspace/workspaceActionsContext";
import { trackEvent } from "@/lib/analytics";
import { LATEST_CHANGELOG_TITLE } from "@/lib/changelog";

import { RecentSessions } from "./components/RecentSessions";
import { VersionFooter } from "./components/VersionFooter";
import styles from "./StartPage.module.css";

const CATEGORY = "Aba Inicial";

export function StartPage() {
  const [logo] = useState(() => seasonalLogo());
  const { openEditor, openFilesFromDisk, openChangelog } = useWorkspaceActions();
  const { openExamples } = useAppDialogs();

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <BrandLogo variant={logo} className={styles.logo} />

        <div className={styles.actions}>
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
            <Kbd className={styles.shortcut}>Ctrl N</Kbd>
          </Button>

          <div className={styles.secondaryActions}>
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
          className={styles.news}
          onClick={() => {
            trackEvent("open_changelog", CATEGORY, "Ver histórico de atualizações");
            openChangelog();
          }}
        >
          <span className={styles.newsLabel}>Novidades</span>
          <span className={styles.newsTitle}>{LATEST_CHANGELOG_TITLE}</span>
          <ArrowRight className={styles.newsArrow} />
        </button>
      </div>

      <VersionFooter />
    </div>
  );
}
