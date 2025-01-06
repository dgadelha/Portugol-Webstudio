export const portugolGraphicsContext = /* javascript */ `
class PortugolGraphicsContext {
  width = 800;
  height = 600;

  workingColor = 0;
  workingOpacity = 255;
  workingRotation = 0;

  workingTextFont = "serif";
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

  getWidth() {
    if (this.canvas) {
      return this.canvas.width;
    }

    return this.width;
  }

  getHeight() {
    if (this.canvas) {
      return this.canvas.height;
    }

    return this.height;
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

  setWorkingColorFromRGBA(r, g, b, a) {
    this.drawCall(() => {
      const alpha = (a === undefined || a === null) ? 255 : a;
      const value = ((alpha & 0xFF) << 24) |
        ((r & 0xFF) << 16) |
        ((g & 0xFF) << 8) |
        ((b & 0xFF) << 0);
      this.workingColor = value;
    });
  }

  getWorkingColorAsRGBA() {
    return {
      a: (this.workingColor >> 24) & 0xff,
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

    const { r, g, b } = this.getWorkingColorAsRGBA();

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

  setWorkingFont(font) {
    this.drawCall(() => {
      this.workingTextFont = font;
    });
  }

  getWorkingFont() {
    return this.workingTextFont;
  }

  setWorkingRotation(rotation) {
    this.drawCall(() => {
      this.workingRotation = rotation;
    });
  }

  getWorkingRotation() {
    return this.workingRotation;
  }

  getWorkingRotationInRadians() {
    return this.workingRotation * Math.PI / 180;
  }

  drawCall(drawFunc) {
    this.drawCalls.push(drawFunc);
  }

  applyWorkParams(ignoreRotation, objectBounds) {
    if (this.canvasContext) {
      const hexColor = this.getWorkingColorAsHex();

      this.canvasContext.strokeStyle = hexColor;
      this.canvasContext.fillStyle = hexColor;
      this.canvasContext.globalAlpha = this.getWorkingOpacityAsRange1();

      this.canvasContext.font =
        (this.workingTextStyle.italic ? "italic " : "") +
        (this.workingTextStyle.bold ? "bold " : "") +
        this.workingTextSize + "px " +
        this.workingTextFont;

      const rotation = this.getWorkingRotationInRadians();
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);

      if (!ignoreRotation && rotation > 0) {
        if (objectBounds) {
          const { x, y, width, height } = objectBounds;
          this.canvasContext.translate(x + (width / 2), y + (height / 2));
        }

        this.canvasContext.rotate(rotation);
      }
    }
  }

  applyTransformationToBounds(objectBounds) {
    const rotation = this.getWorkingRotationInRadians();

    if (rotation > 0) {
      return {
        x: -(objectBounds.width / 2),
        y: -(objectBounds.height / 2),
        width: objectBounds.width,
        height: objectBounds.height,
      }
    }

    return objectBounds;
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
        this.applyWorkParams(true);
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    });
  }

  drawRect(x, y, width, height, rounded, fill) {
    this.drawCall(() => {
      if (this.canvasContext) {
        const bounds = {
          x,
          y,
          width,
          height,
        };

        this.applyWorkParams(false, bounds);

        const { x: rx, y: ry, width: rwidth, height: rheight } = this.applyTransformationToBounds(bounds);

        if (rounded) {
          this.canvasContext.roundRect(rx, ry, rwidth, rheight, 5);

          if (fill) {
            this.canvasContext.fill();
          } else {
            this.canvasContext.stroke();
          }
        } else {
          if (fill) {
            this.canvasContext.fillRect(rx, ry, rwidth, rheight);
          } else {
            this.canvasContext.strokeRect(rx, ry, rwidth, rheight);
          }
        }
      }
    });
  }

  drawEllipse(x, y, width, height, fill) {
    this.drawCall(() => {
      if (this.canvasContext) {
        const bounds = {
          x,
          y,
          width,
          height,
        };

        this.applyWorkParams(false, bounds);

        const { x: rx, y: ry, width: rwidth, height: rheight } = this.applyTransformationToBounds(bounds);

        this.canvasContext.beginPath();
        this.canvasContext.ellipse(rx + (rwidth / 2), ry + (rheight / 2), rwidth / 2, rheight / 2, 0, 0, 2 * Math.PI);
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
        this.applyWorkParams(true);
        this.canvasContext.fillRect(x, y, 1, 1);
      }
    });
  }

  calculatePolygonArea(points) {
    let minX, minY, maxX, maxY;

    points.forEach((point, index) => {
      if (index === 0) {
        minX = point[0];
        minY = point[1];
        maxX = point[0];
        maxY = point[1];
      } else {
        minX = Math.min(minX, point[0]);
        minY = Math.min(minY, point[1]);
        maxX = Math.max(maxX, point[0]);
        maxY = Math.max(maxY, point[1]);
      }
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  applyTransformationToPolygon(points, bounds) {
    const rotation = this.getWorkingRotationInRadians();

    if (rotation > 0) {
      return points.map((point) => [
        point[0] - bounds.x - (bounds.width / 2),
        point[1] - bounds.y - (bounds.height / 2)
      ]);
    }

    return points;
  }

  drawPolygon(points, fill) {
    this.drawCall(() => {
      if (this.canvasContext && points.length > 0) {
        const bounds = this.calculatePolygonArea(points);

        this.applyWorkParams(false, bounds);

        const rpoints = this.applyTransformationToPolygon(points, bounds);

        this.canvasContext.beginPath();

        rpoints.forEach((point, index) => {
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
    });
  }

  drawText(x, y, text) {
    this.drawCall(() => {
      if (this.canvasContext) {
        const { width, height } = this.canvasContext.measureText(text);

        const bounds = {
          x,
          y,
          width,
          height,
        };

        this.applyWorkParams(false, bounds);

        const { x: rx, y: ry, width: rwidth, height: rheight } = this.applyTransformationToBounds(bounds);

        this.canvasContext.fillText(text, rx, ry);

        if (this.workingTextStyle.underline) {
          const underlineBounds = {
            x,
            y,
            width,
            height: 1,
          };

          this.applyWorkParams(false, underlineBounds);

          const { x: rux, y: ruy, width: ruwidth, height: ruheight } = this.applyTransformationToBounds(underlineBounds);

          this.canvasContext.fillRect(rux, ruy, ruwidth, ruheight);
        }
      }
    });
  }
}
//endregion
`;
