import { ChevronRight } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

import styles from "./TreeView.module.css";

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
 * Árvore no estilo dos menus da sidebar. Navegável por teclado: Enter/Espaço
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
    <ul role="tree" aria-label={ariaLabel} className={cn(styles.tree, className)}>
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
        className={cn(styles.row, isSelected && styles.selected)}
        onClick={activate}
        onKeyDown={onKeyDown}
      >
        {hasChildren ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={isExpanded ? "Recolher pasta" : "Expandir pasta"}
            className={styles.toggle}
            onClick={event => {
              event.stopPropagation();
              setExpanded(node.id, !isExpanded);
            }}
          >
            <ChevronRight className={cn(styles.chevron, isExpanded && styles.expanded)} />
          </button>
        ) : (
          <span className={styles.spacer} aria-hidden="true" />
        )}

        <span className={styles.label}>{getLabel(node)}</span>
      </div>

      {hasChildren && isExpanded && (
        <ul role="group" className={styles.children}>
          {(node.children as T[]).map(child => (
            <TreeItem key={child.id} node={child} expanded={expanded} setExpanded={setExpanded} {...props} />
          ))}
        </ul>
      )}
    </li>
  );
}
