import { type ReactNode, useState } from "react";

import { TreeView } from "@/components/TreeView";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/Resizable";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAsync } from "@/hooks/useAsync";
import { useIsBelowMd } from "@/hooks/useMediaQuery";
import { trackEvent, trackPageView } from "@/lib/analytics";

import { HelpContent } from "./components/HelpContent";
import { fetchHelpTopics } from "./helpApi";
import { useHelpBridge } from "./hooks/useHelpBridge";
import type { HelpTopic } from "./types";
import styles from "./HelpPane.module.css";

export function HelpPane() {
  const topics = useAsync(signal => fetchHelpTopics(signal), []);

  useHelpBridge();

  if (topics.status === "success") {
    return <HelpBrowser topics={topics.data} />;
  }

  return (
    <HelpLayout sidebar={topics.status === "loading" ? <TreeSkeleton /> : null}>
      {topics.status === "error" && (
        <p className={styles.error}>Não foi possível carregar a Ajuda. Verifique a conexão.</p>
      )}
    </HelpLayout>
  );
}

/**
 * Árvore de tópicos e o conteúdo do escolhido. Começa com as duas primeiras seções abertas e a
 * primeira página selecionada.
 */
function HelpBrowser({ topics }: { topics: HelpTopic[] }) {
  const [current, setCurrent] = useState<HelpTopic | null>(topics[0] ?? null);

  const select = (topic: HelpTopic) => {
    trackEvent("help_navigation", "Ajuda", topic.href || topic.source);
    trackPageView(topic.href || topic.id, topic.text);
    setCurrent(topic);
  };

  return (
    <HelpLayout
      sidebar={
        <TreeView
          aria-label="Tópicos da Ajuda"
          nodes={topics}
          getLabel={topic => topic.text}
          selectedId={current?.id}
          onSelect={select}
          defaultExpanded={topics.slice(0, 2).map(topic => topic.id)}
        />
      }
    >
      {current && <HelpContent topic={current} />}
    </HelpLayout>
  );
}

function HelpLayout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const isBelowMd = useIsBelowMd();

  return (
    <ResizablePanelGroup orientation={isBelowMd ? "vertical" : "horizontal"}>
      <ResizablePanel defaultSize={isBelowMd ? "35%" : 300} minSize={200} className={styles.topics}>
        <div className={styles.topicsHeader}>
          <h1 className={styles.topicsTitle}>Tópicos</h1>
        </div>
        <ScrollArea className={styles.topicsScroll}>
          <div className={styles.tree}>{sidebar}</div>
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel minSize="30%">{children}</ResizablePanel>
    </ResizablePanelGroup>
  );
}

function TreeSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className={styles.skeletonRow} style={{ width: `${55 + ((index * 17) % 40)}%` }} />
      ))}
    </div>
  );
}
