import { Info } from "lucide-react";

import { Markdown } from "@/components/Markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResolvedTheme } from "@/features/settings/useSettings";

import { HELP_BASE_URL } from "../helpApi";
import type { HelpTopic } from "../types";

export function HelpContent({ topic }: { topic: HelpTopic }) {
  const theme = useResolvedTheme();

  if (topic.kind === "markdown") {
    return (
      <ScrollArea className="h-full">
        <Markdown source={topic.source ?? ""} className="mx-auto max-w-3xl px-6 py-6" />
      </ScrollArea>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {theme === "light" && (
        <p className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          As páginas da Ajuda ainda não têm versão no tema claro.
        </p>
      )}

      <iframe title="Conteúdo da Ajuda" src={`${HELP_BASE_URL}/${topic.href}`} className="block flex-1 border-0" />
    </div>
  );
}
