type PortugolGraphicsDrawCall = () => void;

export class PortugolGraphicsContext extends EventTarget {
  window: Window | null = null;
  canvas: HTMLCanvasElement | null = null;
  canvasContext: CanvasRenderingContext2D | null = null;

  private _title = "";

  private _width = 800;
  private _height = 600;

  private _workingColor = 0;
  private _workingOpacity = 255;

  private _drawCalls: PortugolGraphicsDrawCall[] = [];

  /**
   * Inicializa o contexto gráfico.
   */
  init() {
    this.window = window.open("", "graphics", `width=${this._width},height=${this._height},popup=true`);

    if (!this.window) {
      throw new Error("Falha ao abrir a janela, verifique se o bloqueador de popups está ativado!");
    }

    this.window.document.body.style.margin = "0px";
    this.window.document.body.style.padding = "0px";
    this.window.document.body.style.overflow = "hidden";

    this.window.addEventListener("beforeunload", () => {
      this.destroy(true);
    });

    this.canvas = this.window.document.createElement("canvas");
    this.canvas.width = this._width;
    this.canvas.height = this._height;
    this.window.document.body.append(this.canvas);

    this.canvasContext = this.canvas.getContext("2d");

    this.onInit();
  }

  /**
   * Função chamada quando o contexto gráfico é inicializado.
   */
  private onInit() {
    this.dispatchEvent(new Event("init"));
  }

  /**
   * Exibe a janela.
   */
  showWindow() {
    // TODO
  }

  /**
   * Fecha a janela.
   */
  closeWindow(userClose = false) {
    try {
      if (this.window) {
        this.window.close();
      }
    } catch {}

    this.onWindowClose(userClose);
  }

  /**
   * Função chamada quando a janela é fechada.
   */
  private onWindowClose(userClose = false) {
    this.dispatchEvent(new CustomEvent("close", { detail: { userClose } }));
  }

  /**
   * Restaura a janela.
   */
  restoreWindow() {
    if (this.window) {
      this.window.focus();
    }
  }

  /**
   * Minimiza a janela.
   */
  minimizeWindow() {
    // TODO
  }

  /**
   * Destroi o contexto gráfico.
   */
  destroy(userClose = false) {
    this.closeWindow(userClose);
    this.canvas = null;
    this.canvasContext = null;
    this.window = null;
  }

  /**
   * Obtém o título da janela.
   * @returns Título da janela.
   */
  getWindowTitle() {
    return this._title;
  }

  /**
   * Define o título da janela.
   * @param title Título da janela.
   */
  setWindowTitle(title: string) {
    this._title = title;

    if (this.window) {
      this.window.document.title = title;
    }
  }

  /**
   * Obtém a altura da janela.
   * @returns Altura da janela, em pixels.
   */
  getWidth() {
    return this._width;
  }

  /**
   * Obtém a largura da janela.
   * @returns Largura da janela, em pixels.
   */
  getHeight() {
    return this._height;
  }

  /**
   * Redimensiona a janela.
   * @param width Largura da janela, em pixels.
   * @param height Altura da janela, em pixels.
   */
  resize(width: number, height: number) {
    this._width = width;
    this._height = height;

    if (this.window) {
      this.window.resizeTo(width, height);
    }

    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Obtém a largura da tela.
   * @returns Largura da tela, em pixels.
   */
  getScreenWidth() {
    return this.window?.screen.width ?? 0;
  }

  /**
   * Obtém a altura da tela.
   * @returns Altura da tela, em pixels.
   */
  getScreenHeight() {
    return this.window?.screen.height ?? 0;
  }

  /**
   * Entra em modo de tela cheia.
   */
  async enterFullscreen() {
    if (this.window) {
      await this.window.document.documentElement.requestFullscreen();
    }
  }

  /**
   * Sai do modo de tela cheia.
   */
  async exitFullscreen() {
    if (this.window) {
      await this.window.document.exitFullscreen();
    }
  }

  /**
   * Obtém a cor de trabalho.
   * @returns Cor de trabalho.
   */
  getWorkingColor() {
    return this._workingColor;
  }

  /**
   * Define a cor de trabalho.
   * @param color Cor de trabalho.
   */
  setWorkingColor(color: number) {
    this.drawCall(() => {
      this._workingColor = color;
    });
  }

  /**
   * Define a cor de trabalho a partir de um valor RGB.
   * @param r Valor do canal vermelho.
   * @param g Valor do canal verde.
   * @param b Valor do canal azul.
   */
  setWorkingColorFromRgb(r: number, g: number, b: number) {
    this._workingColor = (r << 16) + (g << 8) + b;
  }

  /**
   * Obtém a cor de trabalho no formato RGB.
   * @returns Cor de trabalho no formato RGB.
   */
  getWorkingColorAsRgb() {
    return {
      r: (this._workingColor >> 16) & 0xff,
      g: (this._workingColor >> 8) & 0xff,
      b: this._workingColor & 0xff,
    };
  }

  /**
   * Obtém a cor de trabalho no formato hexadecimal.
   * @returns Cor de trabalho no formato hexadecimal.
   */
  getWorkingColorAsHex() {
    // WHITE_COLOR: -1
    // BLACK_COLOR: -16777216

    const componentToHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };

    const { r, g, b } = this.getWorkingColorAsRgb();

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  /**
   * Obtém a opacidade de trabalho.
   * @returns Opacidade de trabalho.
   */
  getWorkingOpacity() {
    return this._workingOpacity;
  }

  /**
   * Obtém a opacidade de trabalho no formato de 0 a 1.
   * @returns Opacidade de trabalho no formato de 0 a 1.
   */
  getWorkingOpacityAsRange1() {
    return this._workingOpacity / 255;
  }

  /**
   * Define a opacidade de trabalho.
   * @param opacity Opacidade de trabalho.
   */
  setWorkingOpacity(opacity: number) {
    this.drawCall(() => {
      this._workingOpacity = opacity;
    });
  }

  /**
   * Função interna para adicionar um desenho na lista de chamadas.
   * @param drawFunc Função de desenho.
   */
  private drawCall(drawFunc: PortugolGraphicsDrawCall) {
    this._drawCalls.push(drawFunc);
  }

  /**
   * Aplica os parâmetros de trabalho no canvas.
   */
  private applyWorkParams() {
    if (this.canvasContext) {
      const hexColor = this.getWorkingColorAsHex();
      this.canvasContext.strokeStyle = hexColor;
      this.canvasContext.fillStyle = hexColor;
      this.canvasContext.globalAlpha = this.getWorkingOpacityAsRange1();
    }
  }

  /**
   * Renderiza a tela.
   */
  render() {
    this.window?.requestAnimationFrame(() => {
      if (this._drawCalls.length > 0) {
        for (const drawCall of this._drawCalls) {
          drawCall();
        }

        this._drawCalls = [];
      }

      this.onRendered();
    });
  }

  /**
   * Função chamada quando a tela é renderizada.
   */
  private onRendered() {
    this.dispatchEvent(new Event("rendered"));
  }

  /**
   * Limpa a tela.
   */
  clearRender() {
    this.drawCall(() => {
      if (this.canvas && this.canvasContext) {
        this.applyWorkParams();
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    });
  }

  /**
   * Desenha um retângulo.
   * @param x Posição X do retângulo.
   * @param y Posição Y do retângulo.
   * @param width Largura do retângulo.
   * @param height Altura do retângulo.
   * @param rounded Se deve arredondar os cantos do retângulo.
   * @param fill Se deve preencher o retângulo.
   */
  drawRect(x: number, y: number, width: number, height: number, rounded: boolean, fill: boolean) {
    this.drawCall(() => {
      if (this.canvasContext) {
        this.applyWorkParams();

        if (rounded) {
          this.canvasContext.roundRect(x, y, width, height, 10);

          if (fill) {
            this.canvasContext.fill();
          } else {
            this.canvasContext.stroke();
          }
        } else {
          if (fill) {
            this.canvasContext.fillRect(x, y, width, height);
          } else {
            this.canvasContext.strokeRect(x, y, width, height);
          }
        }
      }
    });
  }
}
