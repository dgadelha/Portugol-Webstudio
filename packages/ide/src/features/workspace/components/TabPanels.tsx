import { Loader2 } from "lucide-react";
import { lazy, type ReactNode, Suspense } from "react";

import { StartPage } from "@/features/start/StartPage";
import { cn } from "@/lib/utils";

import type { Tab } from "../types";
import { useActiveTabId, useTabs } from "../useWorkspace";
import styles from "./TabPanels.module.css";

// O editor (parser, runner), a ajuda (bibliotecas) e o histórico só são baixados quando uma aba
// deles é aberta: a aba inicial carrega leve.
const EditorPane = lazy(() => import("@/features/editor/EditorPane").then(m => ({ default: m.EditorPane })));
const HelpPane = lazy(() => import("@/features/help/HelpPane").then(m => ({ default: m.HelpPane })));
const ChangelogPane = lazy(() =>
  import("@/features/changelog/ChangelogPane").then(m => ({ default: m.ChangelogPane })),
);

/**
 * Todas as abas ficam montadas e só a ativa aparece: trocar de aba não perde o programa em
 * execução, o histórico de desfazer do editor nem a posição da rolagem.
 */
export function TabPanels() {
  const tabs = useTabs();
  const activeTabId = useActiveTabId();

  return (
    <div className={styles.panels}>
      <TabPanel active={activeTabId === null}>
        <StartPage />
      </TabPanel>

      {tabs.map(tab => (
        <TabPanel key={tab.id} active={tab.id === activeTabId}>
          <Suspense fallback={<PanelLoading />}>
            <TabContent tab={tab} active={tab.id === activeTabId} />
          </Suspense>
        </TabPanel>
      ))}
    </div>
  );
}

function TabPanel({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <section hidden={!active} className={styles.panel}>
      {children}
    </section>
  );
}

function PanelLoading() {
  return (
    <div className={styles.loading}>
      <Loader2 className={cn(styles.spinner, "spin")} aria-label="Carregando" />
    </div>
  );
}

function TabContent({ tab, active }: { tab: Tab; active: boolean }) {
  switch (tab.type) {
    case "editor": {
      return <EditorPane tabId={tab.id} active={active} />;
    }

    case "help": {
      return <HelpPane />;
    }

    case "changelog": {
      return <ChangelogPane />;
    }
  }
}
