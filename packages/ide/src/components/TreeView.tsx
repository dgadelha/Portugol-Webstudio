import { ChevronRight } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  children?: TreeNode[];
}

interface TreeViewProps<T extends TreeNode> {
  nodes: T[];
  getLabel: (node: T) => ReactNode;
  selectedId?: string | null;
  onSelect?: (node: T) => void;
  /**
   * Pastas abertas de início.
   */
  defaultExpanded?: string[];
  /**
   * O que um clique na pasta faz: seleciona (a pasta tem conteúdo próprio) ou só abre e fecha.
   */
  branchClick?: "select" | "toggle";
  "aria-label"?: string;
  className?: string;
}

/**
 * Árvore no estilo dos menus da sidebar do shadcn. Navegável por teclado: Enter/Espaço
 * selecionam, setas abrem e fecham pastas.
 */
export function TreeView<T extends TreeNode>({
  nodes,
  defaultExpanded = [],
  className,
  "aria-label": ariaLabel,
  ...props
}: TreeViewProps<T>) {
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded));

  const setNodeExpanded = (id: string, value: boolean) => {
    setExpanded(current => {
      const next = new Set(current);

      if (value) next.add(id);
      else next.delete(id);

      return next;
    });
  };

  return (
    <ul role="tree" aria-label={ariaLabel} className={cn("grid gap-0.5 text-sm", className)}>
      {nodes.map(node => (
        <TreeItem key={node.id} node={node} expanded={expanded} setExpanded={setNodeExpanded} {...props} />
      ))}
    </ul>
  );
}

interface TreeItemProps<T extends TreeNode> extends Omit<TreeViewProps<T>, "nodes" | "defaultExpanded" | "className"> {
  node: T;
  expanded: Set<string>;
  setExpanded: (id: string, value: boolean) => void;
}

function TreeItem<T extends TreeNode>({ node, expanded, setExpanded, ...props }: TreeItemProps<T>) {
  const { getLabel, selectedId, onSelect, branchClick = "select" } = props;
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  const activate = () => {
    if (hasChildren && branchClick === "toggle") {
      setExpanded(node.id, !isExpanded);
    } else {
      onSelect?.(node);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    } else if (hasChildren && event.key === "ArrowRight") {
      event.preventDefault();
      setExpanded(node.id, true);
    } else if (hasChildren && event.key === "ArrowLeft") {
      event.preventDefault();
      setExpanded(node.id, false);
    }
  };

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <div
        tabIndex={0}
        className={cn(
          "flex h-8 cursor-pointer items-center gap-1 rounded-md px-1.5 text-foreground/80 transition-colors outline-none select-none",
          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
          isSelected && "bg-accent font-medium text-accent-foreground",
        )}
        onClick={activate}
        onKeyDown={onKeyDown}
      >
        {hasChildren ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={`${isExpanded ? "Recolher" : "Expandir"} ${String(getLabel(node))}`}
            className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
            onClick={event => {
              event.stopPropagation();
              setExpanded(node.id, !isExpanded);
            }}
          >
            <ChevronRight className={cn("size-4 transition-transform", isExpanded && "rotate-90")} />
          </button>
        ) : (
          <span className="size-5 shrink-0" aria-hidden="true" />
        )}

        <span className="truncate">{getLabel(node)}</span>
      </div>

      {hasChildren && isExpanded && (
        <ul role="group" className="mt-0.5 ml-3.5 grid gap-0.5 border-l pl-1.5">
          {(node.children as T[]).map(child => (
            <TreeItem key={child.id} node={child} expanded={expanded} setExpanded={setExpanded} {...props} />
          ))}
        </ul>
      )}
    </li>
  );
}
