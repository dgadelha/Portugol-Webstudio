import { X } from "lucide-react";
import { type PointerEvent, type Ref, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

interface GraphicsWindowProps {
  title: string;
  canvasRef: Ref<HTMLCanvasElement>;
  onClose: () => void;
}

/**
 * Janela flutuante onde a biblioteca Graficos desenha. Não bloqueia o editor e pode ser
 * arrastada pela barra de título.
 */
export function GraphicsWindow({ title, canvasRef, onClose }: GraphicsWindowProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startY: event.clientY, originX: offset.x, originY: offset.y };
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!drag.current) {
      return;
    }

    setOffset({
      x: drag.current.originX + event.clientX - drag.current.startX,
      y: drag.current.originY + event.clientY - drag.current.startY,
    });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  return createPortal(
    <div
      role="dialog"
      aria-label={title || "Janela gráfica"}
      className="fixed top-1/2 left-1/2 z-50 flex max-h-[95vh] max-w-[95vw] flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl"
      style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` }}
    >
      <header
        className="flex h-10 cursor-move touch-none items-center gap-2 border-b pr-1.5 pl-4 select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="flex-1 truncate text-sm font-medium">{title}</span>
        <Button type="button" variant="ghost" size="icon-xs" aria-label="Fechar janela" onClick={onClose}>
          <X />
        </Button>
      </header>

      <div className="overflow-auto">
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>,
    document.body,
  );
}
