import type { PortugolExecutor, PortugolMessage } from "@portugol-webstudio/runner";

/**
 * O que a interface oferece para a biblioteca Graficos desenhar: uma janela com um canvas.
 */
export interface GraphicsWindowHandle {
  close(): void;
  getCanvas(): Promise<OffscreenCanvas>;
  setTitle(title: string): void;
  setSize(width: number, height: number): void;
}

export class CreateGraphicsWindowEvent extends Event {
  window?: GraphicsWindowHandle;
}

/**
 * Atende as mensagens `graphics.*` que o programa em execução envia do worker. A janela em si é
 * pedida à interface pelo evento `create`.
 */
export class GraphicsRenderer extends EventTarget {
  private window?: GraphicsWindowHandle | null;
  private canvas?: OffscreenCanvas | null;

  constructor(private readonly executor: PortugolExecutor) {
    super();
  }

  destroy() {
    this.window = null;
    this.canvas = null;
  }

  async handleMessage(message: PortugolMessage) {
    switch (message.type) {
      case "graphics.create": {
        await this.createWindow();

        if (this.canvas) {
          this.executor.replyMessage(message, this.canvas, [this.canvas]);
        } else {
          this.executor.replyMessage(message, null);
        }

        break;
      }

      case "graphics.destroy": {
        this.window?.close();
        this.destroy();
        this.executor.replyMessage(message, null);
        break;
      }

      case "graphics.setWindowSize": {
        const { width, height } = message.data as { width: number; height: number };

        this.window?.setSize(width, height);
        this.executor.replyMessage(message, null);
        break;
      }

      case "graphics.setWindowTitle": {
        const { title } = message.data as { title: string };

        this.window?.setTitle(title);
        this.executor.replyMessage(message, null);
        break;
      }

      case "graphics.closeWindow": {
        this.window?.close();
        this.executor.replyMessage(message, null);
        break;
      }

      case "graphics.getScreenInfo": {
        this.executor.replyMessage(message, {
          width: window.screen.width,
          height: window.screen.height,
          pixelDepth: window.screen.pixelDepth,
        });

        break;
      }

      // Sem equivalente no navegador: só confirma para o programa seguir.
      case "graphics.showWindow":
      case "graphics.hideWindowBorder":
      case "graphics.minimizeWindow":
      case "graphics.restoreWindow":
      case "graphics.enterFullscreen":
      case "graphics.exitFullscreen": {
        this.executor.replyMessage(message, null);
        break;
      }
    }
  }

  private async createWindow() {
    const event = new CreateGraphicsWindowEvent("create");

    this.dispatchEvent(event);

    if (event.window) {
      this.window = event.window;
      this.canvas = await event.window.getCanvas();
    }
  }
}
