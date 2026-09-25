import type { OnMount } from "@monaco-editor/react";
import { ChevronUp, Eraser, SquareTerminal } from "lucide-react";

import { IconButton } from "@/components/IconButton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { OutputConsole } from "./OutputConsole";

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
  onConsoleMount?: OnMount;
}

function RunStatus({ running, waitingForInput }: Pick<OutputPanelProps, "running" | "waitingForInput">) {
  if (waitingForInput) {
    return (
      <Badge variant="outline" className="gap-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400">
        <span className="size-1.5 animate-pulse rounded-full bg-current" />
        Aguardando entrada
      </Badge>
    );
  }

  if (running) {
    return (
      <Badge variant="outline" className="gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
        <span className="size-1.5 animate-pulse rounded-full bg-current" />
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
    <div className="flex h-full flex-col">
      <div
        className="flex shrink-0 cursor-pointer items-center gap-2 border-b px-3 select-none"
        style={{ height: OUTPUT_HEADER_HEIGHT }}
        onClick={event => {
          // Os botões do cabeçalho têm ação própria.
          if (!(event.target as HTMLElement).closest("button")) onToggle();
        }}
      >
        <SquareTerminal className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-medium">Saída</h2>
        <RunStatus running={running} waitingForInput={waitingForInput} />

        <div className="ml-auto flex items-center gap-1">
          <IconButton
            label="Limpar saída"
            tooltipSide="top"
            size="icon-xs"
            className="text-muted-foreground"
            icon={<Eraser />}
            disabled={!output || running}
            onClick={onClear}
          />
          <IconButton
            label={collapsed ? "Mostrar saída" : "Recolher saída"}
            tooltipSide="top"
            size="icon-xs"
            className="text-muted-foreground"
            aria-expanded={!collapsed}
            icon={<ChevronUp className={cn("transition-transform", !collapsed && "rotate-180")} />}
            onClick={onToggle}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <OutputConsole output={output} onInput={onInput} onMount={onConsoleMount} />
      </div>
    </div>
  );
}
