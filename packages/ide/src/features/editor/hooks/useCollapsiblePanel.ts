import { useCallback, useRef, useState } from "react";
import type { PanelSize } from "react-resizable-panels";
import { usePanelRef } from "react-resizable-panels";

/**
 * Controla um painel recolhível que começa recolhido. Lembra o último tamanho aberto que o
 * usuário escolheu, para voltar a ele ao abrir de novo.
 */
export function useCollapsiblePanel({
  collapsedSize,
  defaultOpenSize,
}: {
  collapsedSize: number;
  defaultOpenSize: string;
}) {
  const panelRef = usePanelRef();
  const [collapsed, setCollapsed] = useState(true);
  const lastOpenSize = useRef<number | null>(null);

  const onResize = useCallback(
    (size: PanelSize) => {
      const isCollapsed = size.inPixels <= collapsedSize + 1;

      setCollapsed(isCollapsed);

      if (!isCollapsed) {
        lastOpenSize.current = size.asPercentage;
      }
    },
    [collapsedSize],
  );

  const expand = useCallback(() => {
    const panel = panelRef.current;

    if (panel?.isCollapsed() ?? true) {
      panel?.resize(lastOpenSize.current === null ? defaultOpenSize : `${lastOpenSize.current}%`);
    }
  }, [panelRef, defaultOpenSize]);

  const collapse = useCallback(() => {
    panelRef.current?.collapse();
  }, [panelRef]);

  const toggle = useCallback(() => {
    if (panelRef.current?.isCollapsed() ?? collapsed) {
      expand();
    } else {
      collapse();
    }
  }, [panelRef, collapsed, expand, collapse]);

  return { panelRef, collapsed, onResize, expand, collapse, toggle };
}
