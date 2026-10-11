export const portugolGraphicsContext = /* javascript */ `
class PortugolGraphicsContext {
  initialized = false;
  fullscreen = false;
  sizeBeforeFullscreen = { width: 640, height: 480 };

  width = 800;
  height = 600;

  workingFillMode = 0; // 0 = color, 1 = gradient
  workingColor = 0;
  workingOpacity = 255;
  workingRotation = 0;
  workingGradient = {
    type: 0,
    colorA: 0,
    colorB: 0,
  };

  // Como a fonte padrão do Portugol Studio (Dialog, 12)
  workingTextFont = "sans-serif";
  workingTextSize = 12;
  workingTextStyle = {
    bold: false,
    italic: false,
    underline: false,
  };

  // Estado na ordem das chamadas, não na dos desenhos: o Portugol Studio mede
  // o texto com a fonte já definida, e o definir_opacidade volta à última cor
  definedColor = 0;
  definedTextFont = this.workingTextFont;
  definedTextSize = this.workingTextSize;
  definedTextStyle = { ...this.workingTextStyle };

  drawCalls = [];

  yieldChannel = null;
  lastAnimationFrame = 0;

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
    this.definedColor = color;

    this.drawCall(() => {
      this.workingColor = color;
      this.workingFillMode = 0;
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

  colorToRGBA(color) {
    return {
      a: (color >> 24) & 0xFF,
      r: (color >> 16) & 0xFF,
      g: (color >> 8) & 0xFF,
      b: (color >> 0) & 0xFF,
    };
  }

  getWorkingColorAsRGBA() {
    return this.colorToRGBA(this.workingColor);
  }

  colorToHex(color) {
    const componentToHex = (c) => {
      const hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };

    const { r, g, b } = this.colorToRGBA(color);

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  getWorkingColorAsHex() {
    return this.colorToHex(this.workingColor);
  }

  setWorkingGradient(type, colorA, colorB) {
    this.drawCall(() => {
      this.workingGradient.type = type;
      this.workingGradient.colorA = colorA;
      this.workingGradient.colorB = colorB;
      this.workingFillMode = 1;
    });
  }

  getWorkingOpacity() {
    return this.workingOpacity;
  }

  getWorkingOpacityAsRange1() {
    return this.workingOpacity / 255;
  }

  setWorkingOpacity(opacity) {
    const color = this.definedColor;

    // No Portugol Studio, o definir_opacidade redefine a última cor e assim
    // também desfaz o gradiente
    this.drawCall(() => {
      this.workingOpacity = opacity;
      this.workingColor = color;
      this.workingFillMode = 0;
    });
  }

  setWorkingTextStyle(italic, bold, underline) {
    this.definedTextStyle = { italic, bold, underline };

    // Como no Portugol Studio, recriar a fonte trunca o tamanho
    this.definedTextSize = Math.trunc(this.definedTextSize);

    this.drawCall(() => {
      this.workingTextSize = Math.trunc(this.workingTextSize);
      this.workingTextStyle.italic = italic;
      this.workingTextStyle.bold = bold;
      this.workingTextStyle.underline = underline;
    });
  }

  getWorkingTextStyle() {
    return this.workingTextStyle;
  }

  setWorkingTextSize(size) {
    this.definedTextSize = size;

    this.drawCall(() => {
      this.workingTextSize = size;
    });
  }

  getWorkingTextSize() {
    return this.workingTextSize;
  }

  setWorkingFont(font) {
    this.definedTextFont = font;
    this.definedTextSize = Math.trunc(this.definedTextSize);

    this.drawCall(() => {
      this.workingTextFont = font;
      this.workingTextSize = Math.trunc(this.workingTextSize);
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
    if (this.drawCalls.length >= 131072) {
      throw new Error("A função Graficos.renderizar() não foi chamada nenhuma vez em seu código ou o número de operações de desenho que você chamou antes do Graficos.renderizar() foi muito grande");
    }

    this.drawCalls.push(drawFunc);
  }

  buildFont(style, size, font) {
    return (style.italic ? "italic " : "") +
      (style.bold ? "bold " : "") +
      size + "px " +
      font;
  }

  applyWorkParams(ignoreRotation, objectBounds, gradientBounds) {
    if (this.canvasContext) {
      const targetBounds = gradientBounds ? {
        ...gradientBounds,
      } : objectBounds ? {
        ...objectBounds,
      } : {
        x: 0,
        y: 0,
        width: this.canvas.width,
        height: this.canvas.height
      };

      if (this.workingFillMode === 1 && this.isGradientDegenerate(targetBounds)) {
        // O canvas não pinta um gradiente sem comprimento; o Portugol Studio
        // pinta com a primeira cor
        const colorAHex = this.colorToHex(this.workingGradient.colorA);
        this.canvasContext.strokeStyle = colorAHex;
        this.canvasContext.fillStyle = colorAHex;
      } else if (this.workingFillMode === 1) {
        const colorAHex = this.colorToHex(this.workingGradient.colorA);
        const colorBHex = this.colorToHex(this.workingGradient.colorB);

        let gradient = null;

        switch (this.workingGradient.type) {
          case 0: { // GRADIENTE_DIREITA
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x + targetBounds.width,
              targetBounds.y,
              targetBounds.x,
              targetBounds.y
            );

            gradient.addColorStop(0, colorBHex);
            gradient.addColorStop(1, colorAHex);
            break;
          }

          case 1: { // GRADIENTE_ESQUERDA
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x + targetBounds.width,
              targetBounds.y,
              targetBounds.x,
              targetBounds.y
            );

            gradient.addColorStop(0, colorAHex);
            gradient.addColorStop(1, colorBHex);
            break;
          }

          case 2: { // GRADIENTE_ACIMA
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x,
              targetBounds.y + targetBounds.height,
              targetBounds.x,
              targetBounds.y
            );

            gradient.addColorStop(0, colorAHex);
            gradient.addColorStop(1, colorBHex);
            break;
          }

          case 3: { // GRADIENTE_ABAIXO
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x,
              targetBounds.y + targetBounds.height,
              targetBounds.x,
              targetBounds.y
            );

            gradient.addColorStop(0, colorBHex);
            gradient.addColorStop(1, colorAHex);
            break;
          }

          case 4: { // GRADIENTE_INFERIOR_DIREITO
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x,
              targetBounds.y,
              targetBounds.x + targetBounds.width,
              targetBounds.y + targetBounds.height
            );

            gradient.addColorStop(0, colorAHex);
            gradient.addColorStop(1, colorBHex);
            break;
          }

          case 5: { // GRADIENTE_INFERIOR_ESQUERDO: do canto superior direito ao inferior esquerdo
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x + targetBounds.width,
              targetBounds.y,
              targetBounds.x,
              targetBounds.y + targetBounds.height
            );

            gradient.addColorStop(0, colorAHex);
            gradient.addColorStop(1, colorBHex);
            break;
          }

          case 6: { // GRADIENTE_SUPERIOR_DIREITO
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x,
              targetBounds.y + targetBounds.height,
              targetBounds.x + targetBounds.width,
              targetBounds.y
            );

            gradient.addColorStop(0, colorAHex);
            gradient.addColorStop(1, colorBHex);
            break;
          }

          case 7: { // GRADIENTE_SUPERIOR_ESQUERDO: do canto inferior direito ao superior esquerdo
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x + targetBounds.width,
              targetBounds.y + targetBounds.height,
              targetBounds.x,
              targetBounds.y
            );

            gradient.addColorStop(0, colorAHex);
            gradient.addColorStop(1, colorBHex);
            break;
          }

          default: {
            gradient = this.canvasContext.createLinearGradient(
              targetBounds.x + targetBounds.width,
              targetBounds.y,
              targetBounds.x,
              targetBounds.y
            );

            gradient.addColorStop(0, colorBHex);
            gradient.addColorStop(1, colorAHex);
            break;
          }
        }

        this.canvasContext.strokeStyle = gradient;
        this.canvasContext.fillStyle = gradient;
      } else {
        const hexColor = this.getWorkingColorAsHex();
        this.canvasContext.strokeStyle = hexColor;
        this.canvasContext.fillStyle = hexColor;
      }

      this.canvasContext.globalAlpha = this.getWorkingOpacityAsRange1();

      this.canvasContext.font = this.buildFont(this.workingTextStyle, this.workingTextSize, this.workingTextFont);

      const rotation = this.getWorkingRotationInRadians();
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);

      if (!ignoreRotation && rotation !== 0) {
        if (objectBounds) {
          const { x, y, width, height } = objectBounds;
          // Como no Portugol Studio, o centro é arredondado para um pixel inteiro
          this.canvasContext.translate(x + (width >> 1), y + (height >> 1));
        }

        this.canvasContext.rotate(rotation);
      }
    }
  }

  isGradientDegenerate(bounds) {
    switch (this.workingGradient.type) {
      case 2: // GRADIENTE_ACIMA
      case 3: // GRADIENTE_ABAIXO
        return bounds.height === 0;

      case 4: // GRADIENTE_INFERIOR_DIREITO
      case 5: // GRADIENTE_INFERIOR_ESQUERDO
      case 6: // GRADIENTE_SUPERIOR_DIREITO
      case 7: // GRADIENTE_SUPERIOR_ESQUERDO
        return bounds.width === 0 && bounds.height === 0;

      default: // horizontais
        return bounds.width === 0;
    }
  }

  applyTransformationToBounds(objectBounds) {
    const rotation = this.getWorkingRotationInRadians();

    if (rotation !== 0) {
      return {
        x: -(objectBounds.width >> 1),
        y: -(objectBounds.height >> 1),
        width: objectBounds.width,
        height: objectBounds.height,
      };
    }

    return objectBounds;
  }

  // Como no Portugol Studio, o 'renderizar' desenha na hora e não espera a tela
  // atualizar: a velocidade do programa depende só do 'aguarde'. O navegador
  // mostra o último quadro completo a cada atualização da tela.
  async render() {
    this.startAnimationFrameHeartbeat();

    // Com a aba escondida, o navegador para de chamar o requestAnimationFrame:
    // o programa espera por ele e fica pausado, sem gastar processamento
    if (performance.now() - this.lastAnimationFrame > 250) {
      await new Promise((resolve) => self.requestAnimationFrame(resolve));
    }

    this.drawFrame();

    // Devolve a vez ao navegador, que só mostra o quadro quando a tarefa termina
    await new Promise((resolve) => {
      this.yieldChannel.port1.onmessage = resolve;
      this.yieldChannel.port2.postMessage(null);
    });
  }

  startAnimationFrameHeartbeat() {
    if (this.yieldChannel) {
      return;
    }

    this.yieldChannel = new MessageChannel();
    this.lastAnimationFrame = performance.now();

    const tick = () => {
      this.lastAnimationFrame = performance.now();
      self.requestAnimationFrame(tick);
    };

    self.requestAnimationFrame(tick);
  }

  drawFrame() {
    // O Portugol Studio desenha cada quadro do zero: fundo preto e cor preta.
    // O gradiente, por outro lado, continua valendo até o próximo definir_cor.
    this.workingColor = 0;

    if (this.canvas && this.canvasContext) {
      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
      this.canvasContext.globalAlpha = 1;
      this.canvasContext.fillStyle = "#000000";
      this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    const drawCalls = this.drawCalls;
    this.drawCalls = [];

    for (const drawCall of drawCalls) {
      drawCall();
    }
  }

  clearRender() {
    this.drawCall(() => {
      if (this.canvas && this.canvasContext) {
        this.applyWorkParams(true);
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    });
  }

  drawRect(x, y, width, height, rounded, fill) {
    this.drawCall(() => {
      // Como no Java, tamanho negativo não desenha nada
      if (this.canvasContext && width >= 0 && height >= 0) {
        const bounds = {
          x,
          y,
          width,
          height,
        };

        this.applyWorkParams(false, bounds);

        const { x: rx, y: ry, width: rwidth, height: rheight } = this.applyTransformationToBounds(bounds);

        // O contorno de 1 pixel fica nítido no meio do pixel e, como no Java,
        // cobre largura + 1 pixels
        const offset = fill ? 0 : 0.5;

        if (!fill && (width === 0 || height === 0)) {
          // Sem largura ou sem altura, o contorno é uma linha, com as pontas
          // incluídas como no Java
          this.canvasContext.lineCap = "square";
          this.canvasContext.beginPath();
          this.canvasContext.moveTo(rx + offset, ry + offset);
          this.canvasContext.lineTo(rx + rwidth + offset, ry + rheight + offset);
          this.canvasContext.stroke();
          this.canvasContext.lineCap = "butt";
        } else if (rounded) {
          this.canvasContext.beginPath();
          // O Portugol Studio usa 20% do menor lado como diâmetro do canto
          const corner = Math.trunc(Math.min(width, height) * 0.2) / 2;
          this.canvasContext.roundRect(rx + offset, ry + offset, rwidth, rheight, corner);
          this.canvasContext.closePath();

          if (fill) {
            this.canvasContext.fill();
          } else {
            this.canvasContext.stroke();
          }
        } else {
          if (fill) {
            this.canvasContext.fillRect(rx, ry, rwidth, rheight);
          } else {
            this.canvasContext.strokeRect(rx + offset, ry + offset, rwidth, rheight);
          }
        }
      }
    });
  }

  drawEllipse(x, y, width, height, fill) {
    this.drawCall(() => {
      // Como no Java, tamanho negativo não desenha nada (e o canvas lançaria um erro)
      if (this.canvasContext && width >= 0 && height >= 0) {
        const bounds = {
          x,
          y,
          width,
          height,
        };

        this.applyWorkParams(false, bounds);

        const { x: rx, y: ry, width: rwidth, height: rheight } = this.applyTransformationToBounds(bounds);

        // Como no retângulo, o contorno fica no meio do pixel
        const offset = fill ? 0 : 0.5;

        this.canvasContext.beginPath();
        this.canvasContext.ellipse(rx + (rwidth / 2) + offset, ry + (rheight / 2) + offset, rwidth / 2, rheight / 2, 0, 0, 2 * Math.PI);
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

    if (rotation !== 0) {
      return points.map((point) => [
        point[0] - bounds.x - (bounds.width >> 1),
        point[1] - bounds.y - (bounds.height >> 1)
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

        // Como no retângulo, o contorno fica no meio do pixel
        const offset = fill ? 0 : 0.5;

        this.canvasContext.beginPath();

        rpoints.forEach((point, index) => {
          if (index === 0) {
            this.canvasContext.moveTo(point[0] + offset, point[1] + offset);
          } else {
            this.canvasContext.lineTo(point[0] + offset, point[1] + offset);
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

  calculateTextSize(text, useDefinedFont = false) {
    if (this.canvasContext) {
      this.applyWorkParams(true);

      if (useDefinedFont) {
        this.canvasContext.font = this.buildFont(this.definedTextStyle, this.definedTextSize, this.definedTextFont);
      }

      const metrics = this.canvasContext.measureText(text);

      // O \`TextMetrics\` não tem \`height\`: como no Portugol Studio
      // (\`FontMetrics.getAscent()\`), a altura é a ascendente da fonte.
      return {
        width: metrics.width,
        height: Math.round(metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent ?? 0),
      };
    }

    return { width: 0, height: 0 };
  }

  drawText(x, y, text) {
    this.drawCall(() => {
      if (this.canvasContext) {
        const { width, height } = this.calculateTextSize(text);

        const bounds = {
          x,
          y,
          width,
          height,
        };

        this.applyWorkParams(false, bounds);

        const { x: rx, y: ry, width: rwidth, height: rheight } = this.applyTransformationToBounds(bounds);

        // Como no Portugol Studio, o \`y\` é o topo do texto, e a linha de base fica
        // em ascendente - descendente + 1 (o canvas não expõe o leading)
        const metrics = this.canvasContext.measureText(text);
        const baseline = Math.round((metrics.fontBoundingBoxAscent ?? 0) - (metrics.fontBoundingBoxDescent ?? 0)) + 1;
        this.canvasContext.fillText(text, rx, ry + baseline);

        if (this.workingTextStyle.underline) {
          const underlineBounds = {
            x,
            y: y + height,
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

  drawLine(x1, y1, x2, y2) {
    this.drawCall(() => {
      if (this.canvasContext) {
        const bounds = {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1),
        };

        // Como no Portugol Studio, o gradiente vai do primeiro ao segundo ponto
        const gradientBounds = {
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
        };

        this.applyWorkParams(false, bounds, gradientBounds);

        // Com rotação, a origem foi para o centro da linha. O meio do pixel deixa
        // a linha nítida, e a ponta quadrada inclui os dois pontos, como no Java
        const { x: rx, y: ry } = this.applyTransformationToBounds(bounds);
        const dx = rx - bounds.x + 0.5;
        const dy = ry - bounds.y + 0.5;

        this.canvasContext.lineCap = "square";
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(x1 + dx, y1 + dy);
        this.canvasContext.lineTo(x2 + dx, y2 + dy);
        this.canvasContext.stroke();
        this.canvasContext.lineCap = "butt";
      }
    });
  }
}
//endregion
`;
