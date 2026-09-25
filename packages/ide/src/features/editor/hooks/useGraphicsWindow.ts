import type { PortugolExecutor } from "@portugol-webstudio/runner";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLatest } from "@/hooks/useLatest";
import { trackEvent } from "@/lib/analytics";

import { type CreateGraphicsWindowEvent, GraphicsRenderer } from "../lib/graphicsRenderer";

export interface GraphicsWindowState {
  title: string;
}

/**
 * Liga a biblioteca Graficos a uma janela da interface. O canvas é transferido para o worker
 * (`OffscreenCanvas`) assim que a janela aparece na tela.
 */
export function useGraphicsWindow(executor: PortugolExecutor, onUserClose: () => void) {
  const [renderer] = useState(() => new GraphicsRenderer(executor));
  const [windowState, setWindowState] = useState<GraphicsWindowState | null>(null);

  const canvasRequest = useRef<((canvas: HTMLCanvasElement) => void) | null>(null);
  const onUserCloseRef = useLatest(onUserClose);

  /**
   * Fechar a janela pelo usuário (ou pelo programa) interrompe a execução, como no Portugol Studio.
   */
  const close = useCallback(() => {
    renderer.destroy();
    setWindowState(null);
    onUserCloseRef.current();
  }, [renderer, onUserCloseRef]);

  /**
   * O programa terminou: a janela some sem mais nada a interromper.
   */
  const dismiss = useCallback(() => {
    renderer.destroy();
    setWindowState(null);
  }, [renderer]);

  useEffect(() => {
    const onCreate = (event: CreateGraphicsWindowEvent) => {
      trackEvent("editor_open_renderer", "Editor", "Abrir modal de renderização");

      const canvas = new Promise<HTMLCanvasElement>(resolve => {
        canvasRequest.current = resolve;
      });

      event.window = {
        getCanvas: async () => (await canvas).transferControlToOffscreen(),
        setTitle: title => {
          setWindowState(current => current && { ...current, title });
        },
        setSize: () => {
          // O canvas acompanha o tamanho definido pelo programa.
        },
        close,
      };

      setWindowState({ title: "" });
    };

    renderer.addEventListener("create", onCreate as EventListener);

    return () => {
      renderer.removeEventListener("create", onCreate as EventListener);
    };
  }, [renderer, close]);

  /**
   * Ref do `<canvas>` da janela: entrega o elemento para quem pediu.
   */
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas && canvasRequest.current) {
      canvasRequest.current(canvas);
      canvasRequest.current = null;
    }
  }, []);

  return { renderer, windowState, canvasRef, close, dismiss };
}
