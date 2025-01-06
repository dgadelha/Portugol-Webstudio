import { PortugolExecutor, PortugolMessage } from "@portugol-webstudio/runner";

export interface IGraphicsRendererComponent {
  getCanvas(): Promise<OffscreenCanvas>;
  setTitle(title: string): void;
  setSize(width: number, height: number): void;
}

export class CreateGraphicsRendererComponentEvent extends Event {
  component?: IGraphicsRendererComponent;
}

export class GraphicsRenderer extends EventTarget {
  private executor: PortugolExecutor;
  private component?: IGraphicsRendererComponent;
  private canvas?: OffscreenCanvas | null;

  constructor(executor: PortugolExecutor) {
    super();
    this.executor = executor;
  }

  async handleRendererMessage(message: PortugolMessage) {
    switch (message.type) {
      case "graphics.create": {
        const event = new CreateGraphicsRendererComponentEvent("create");
        this.dispatchEvent(event);

        if (event.component) {
          this.component = event.component;
          this.canvas = await event.component.getCanvas();
          this.executor.replyMessage(message, this.canvas, [this.canvas]);
        } else {
          this.executor.replyMessage(message, null);
        }

        break;
      }

      case "graphics.setWindowSize": {
        if (this.component) {
          const data = message.data as { width: number; height: number };
          const width = data.width;
          const height = data.height;
          this.component.setSize(width, height);
        }

        this.executor.replyMessage(message, null);
        break;
      }

      case "graphics.setWindowTitle": {
        if (this.component) {
          const data = message.data as { title: string };
          const title = data.title;
          this.component.setTitle(title);
        }

        this.executor.replyMessage(message, null);
        break;
      }
    }
  }

  addEventListener(
    type: "create",
    callback: ((event: CreateGraphicsRendererComponentEvent) => void) | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type, callback, options);
  }
}
