import { useMemo } from "react";

import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  source: string;
  className?: string;
}

/**
 * Renderiza Markdown do próprio projeto (changelog, documentação das bibliotecas).
 */
export function Markdown({ source, className }: MarkdownProps) {
  const html = useMemo(() => renderMarkdown(source), [source]);

  return (
    <div
      className={cn("markdown", className)}
      // eslint-disable-next-line react/no-danger -- conteúdo confiável, vindo do repositório
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
