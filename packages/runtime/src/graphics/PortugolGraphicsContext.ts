export const portugolGraphicsContext = /* javascript */ `
class PortugolGraphicsContext {
  width = 800;
  height = 600;

  workingColor = 0;
  workingOpacity = 255;

  workingTextSize = 14;
  workingTextStyle = {
    bold: false,
    italic: false,
    underline: false,
  };

  drawCalls = [];

  init(canvas) {
    if (!canvas) {
      throw new Error("Não foi possível inicializar o contexto gráfico");
    }

    this.canvas = canvas;
    this.canvasContext = canvas.getContext("2d");
  }

  resize(width, height) {
    this.width = width;
    this.height = height;

    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  getWorkingColor() {
    return this.workingColor;
  }

  setWorkingColor(color) {
    this.drawCall(() => {
      this.workingColor = color;
    });
  }

  setWorkingColorFromRgb(r, g, b) {
    this.workingColor = (r << 16) + (g << 8) + b;
  }

  getWorkingColorAsRgb() {
    return {
      r: (this.workingColor >> 16) & 0xff,
      g: (this.workingColor >> 8) & 0xff,
      b: this.workingColor & 0xff,
    };
  }

  getWorkingColorAsHex() {
    const componentToHex = (c) => {
      const hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };

    const { r, g, b } = this.getWorkingColorAsRgb();

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  getWorkingOpacity() {
    return this.workingOpacity;
  }

  getWorkingOpacityAsRange1() {
    return this.workingOpacity / 255;
  }

  setWorkingOpacity(opacity) {
    this.drawCall(() => {
      this.workingOpacity = opacity;
    });
  }

  setWorkingTextStyle(italic, bold, underline) {
    this.drawCall(() => {
      this.workingTextStyle.italic = italic;
      this.workingTextStyle.bold = bold;
      this.workingTextStyle.underline = underline;
    });
  }

  getWorkingTextStyle() {
    return this.workingTextStyle;
  }

  setWorkingTextSize(size) {
    this.drawCall(() => {
      this.workingTextSize = size;
    });
  }

  getWorkingTextSize() {
    return this.workingTextSize;
  }

  drawCall(drawFunc) {
    this.drawCalls.push(drawFunc);
  }

  applyWorkParams() {
    if (this.canvasContext) {
      const hexColor = this.getWorkingColorAsHex();
      this.canvasContext.strokeStyle = hexColor;
      this.canvasContext.fillStyle = hexColor;
      this.canvasContext.globalAlpha = this.getWorkingOpacityAsRange1();
      this.canvasContext.font =
        (this.workingTextStyle.italic ? "italic " : "") +
        (this.workingTextStyle.bold ? "bold " : "") +
        this.workingTextSize + "px serif";
    }
  }

  render() {
    return new Promise((resolve) => {
      self.requestAnimationFrame(() => {
        while (this.drawCalls.length > 0) {
          this.drawCalls.shift()?.();
        }

        resolve();
      });
    });
  }

  clearRender() {
    this.drawCall(() => {
      if (this.canvas && this.canvasContext) {
        this.applyWorkParams();
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    });
  }

  drawRect(x, y, width, height, rounded, fill) {
    this.drawCall(() => {
      if (this.canvasContext) {
        this.applyWorkParams();

        if (rounded) {
          this.canvasContext.roundRect(x, y, width, height, 5);

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

  drawEllipse(x, y, width, height, fill) {
    this.drawCall(() => {
      if (this.canvasContext) {
        this.applyWorkParams();
        this.canvasContext.beginPath();
        this.canvasContext.ellipse(x + (width / 2), y + (height / 2), width / 2, height / 2, 0, 0, 2 * Math.PI);
        this.canvasContext.closePath();

        if (fill) {
          this.canvasContext.fill();
        } else {
          this.canvasContext.stroke();
        }
      }
    });
  }

  drawPoint(x, y) {
    this.drawCall(() => {
      if (this.canvasContext) {
        this.applyWorkParams();
        this.canvasContext.fillRect(x, y, 1, 1);
      }
    });
  }

  drawPolygon(points, fill) {
    this.drawCall(() => {
      if (this.canvasContext) {
        this.applyWorkParams();

        if (points.length > 0) {
          this.canvasContext.beginPath();

          points.forEach((point, index) => {
            if (index === 0) {
              this.canvasContext.moveTo(point[0], point[1]);
            } else {
              this.canvasContext.lineTo(point[0], point[1]);
            }
          });

          this.canvasContext.closePath();

          if (fill) {
            this.canvasContext.fill();
          } else {
            this.canvasContext.stroke();
          }
        }
      }
    });
  }

  drawText(x, y, text) {
    this.drawCall(() => {
      if (this.canvasContext) {
        this.applyWorkParams();
        this.canvasContext.fillText(text, x, y);

        if (this.workingTextStyle.underline) {
          const { width } = this.canvasContext.measureText(text);
          this.canvasContext.fillRect(x, y, width, 1);
        }
      }
    });
  }
}
//endregion
`;
