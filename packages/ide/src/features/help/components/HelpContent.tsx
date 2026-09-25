import { Info } from "lucide-react";

import { Markdown } from "@/components/Markdown";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useResolvedTheme } from "@/features/settings/useSettings";

import { HELP_BASE_URL } from "../helpApi";
import type { HelpTopic } from "../types";
import styles from "./HelpContent.module.css";

export function HelpContent({ topic }: { topic: HelpTopic }) {
  const theme = useResolvedTheme();

  if (topic.kind === "markdown") {
    return (
      <ScrollArea className={styles.scroll}>
        <Markdown source={topic.source ?? ""} className={styles.markdown} />
      </ScrollArea>
    );
  }

  return (
    <div className={styles.page}>
      {theme === "light" && (
        <p className={styles.notice}>
          <Info className={styles.noticeIcon} aria-hidden="true" />
          As páginas da Ajuda ainda não têm versão no tema claro.
        </p>
      )}

      <iframe title="Conteúdo da Ajuda" src={`${HELP_BASE_URL}/${topic.href}`} className={styles.frame} />
    </div>
  );
}
