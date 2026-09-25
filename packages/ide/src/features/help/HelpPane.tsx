import { type ReactNode, useState } from "react";

import { TreeView } from "@/components/TreeView";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/useAsync";
import { useIsBelowMd } from "@/hooks/useMediaQuery";
import { trackEvent, trackPageView } from "@/lib/analytics";

import { HelpContent } from "./components/HelpContent";
import { fetchHelpTopics } from "./helpApi";
import { useHelpBridge } from "./hooks/useHelpBridge";
import type { HelpTopic } from "./types";

export function HelpPane() {
  const topics = useAsync(signal => fetchHelpTopics(signal), []);

  useHelpBridge();

  if (topics.status === "success") {
    return <HelpBrowser topics={topics.data} />;
  }

  return (
    <HelpLayout sidebar={topics.status === "loading" ? <TreeSkeleton /> : null}>
      {topics.status === "error" && (
        <p className="p-6 text-sm text-muted-foreground">Não foi possível carregar a Ajuda. Verifique a conexão.</p>
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
      <ResizablePanel defaultSize={isBelowMd ? "35%" : 300} minSize={200} className="flex flex-col">
        <div className="flex h-11 shrink-0 items-center border-b px-4">
          <h1 className="text-sm font-medium">Tópicos</h1>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-2">{sidebar}</div>
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel minSize="30%">{children}</ResizablePanel>
    </ResizablePanelGroup>
  );
}

function TreeSkeleton() {
  return (
    <div className="grid gap-2 p-1">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-6" style={{ width: `${55 + ((index * 17) % 40)}%` }} />
      ))}
    </div>
  );
}
