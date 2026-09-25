import { ChevronUp, Eraser, SquareTerminal } from "lucide-react";

import { IconButton } from "@/components/IconButton";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { EditorMount } from "@/lib/monaco/types";

import { OutputConsole } from "./OutputConsole";
import styles from "./OutputPanel.module.css";

/**
 * Altura do cabeçalho da saída: é o que fica visível com o painel recolhido.
 */
export const OUTPUT_HEADER_HEIGHT = 36;

interface OutputPanelProps {
  output: string;
  running: boolean;
  waitingForInput: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onInput: (key: string) => boolean;
  onClear: () => void;
  onConsoleMount?: EditorMount;
}

function RunStatus({ running, waitingForInput }: Pick<OutputPanelProps, "running" | "waitingForInput">) {
  if (waitingForInput) {
    return (
      <Badge variant="outline" className={cn(styles.status, styles.waiting)}>
        <span className={styles.dot} />
        Aguardando entrada
      </Badge>
    );
  }

  if (running) {
    return (
      <Badge variant="outline" className={cn(styles.status, styles.running)}>
        <span className={styles.dot} />
        Executando
      </Badge>
    );
  }

  return null;
}

/**
 * Painel de saída do programa, recolhível pelo cabeçalho.
 */
export function OutputPanel({
  output,
  running,
  waitingForInput,
  collapsed,
  onToggle,
  onInput,
  onClear,
  onConsoleMount,
}: OutputPanelProps) {
  return (
    <div className={styles.panel}>
      <div
        className={styles.header}
        style={{ height: OUTPUT_HEADER_HEIGHT }}
        onClick={event => {
          // Os botões do cabeçalho têm ação própria.
          if (!(event.target as HTMLElement).closest("button")) onToggle();
        }}
      >
        <SquareTerminal className={styles.headerIcon} aria-hidden="true" />
        <h2 className={styles.title}>Saída</h2>
        <RunStatus running={running} waitingForInput={waitingForInput} />

        <div className={styles.actions}>
          <IconButton
            label="Limpar saída"
            tooltipSide="top"
            size="icon-xs"
            className={styles.action}
            icon={<Eraser />}
            disabled={!output || running}
            onClick={onClear}
          />
          <IconButton
            label={collapsed ? "Mostrar saída" : "Recolher saída"}
            tooltipSide="top"
            size="icon-xs"
            className={styles.action}
            aria-expanded={!collapsed}
            icon={<ChevronUp className={cn(styles.chevron, !collapsed && styles.chevronOpen)} />}
            onClick={onToggle}
          />
        </div>
      </div>

      <div className={styles.console}>
        <OutputConsole output={output} waitingForInput={waitingForInput} onInput={onInput} onMount={onConsoleMount} />
      </div>
    </div>
  );
}
