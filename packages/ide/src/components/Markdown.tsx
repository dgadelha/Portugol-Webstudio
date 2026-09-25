import { useMemo } from "react";

import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

import styles from "./Markdown.module.css";

interface MarkdownProps {
  source: string;
  className?: string;
}

/**
 * Renderiza Markdown do próprio projeto (changelog, documentação das bibliotecas).
 */
export function Markdown({ source, className }: MarkdownProps) {
  const html = useMemo(() => renderMarkdown(source), [source]);

  return <div className={cn(styles.markdown, className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
