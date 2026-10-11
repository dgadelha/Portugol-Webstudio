export default /* javascript */ `{
  CANAL_R: new PortugolVar("inteiro", 0, true),
  CANAL_G: new PortugolVar("inteiro", 1, true),
  CANAL_B: new PortugolVar("inteiro", 2, true),

  COR_AMARELO: new PortugolVar("inteiro", -256, true),
  COR_AZUL: new PortugolVar("inteiro", -16776961, true),
  COR_BRANCO: new PortugolVar("inteiro", -1, true),
  COR_PRETO: new PortugolVar("inteiro", -16777216, true),
  COR_VERMELHO: new PortugolVar("inteiro", -65536, true),
  COR_VERDE: new PortugolVar("inteiro", -16711936, true),

  GRADIENTE_DIREITA: new PortugolVar("inteiro", 0, true),
  GRADIENTE_ESQUERDA: new PortugolVar("inteiro", 1, true),
  GRADIENTE_ACIMA: new PortugolVar("inteiro", 2, true),
  GRADIENTE_ABAIXO: new PortugolVar("inteiro", 3, true),
  GRADIENTE_INFERIOR_DIREITO: new PortugolVar("inteiro", 4, true),
  GRADIENTE_INFERIOR_ESQUERDO: new PortugolVar("inteiro", 5, true),
  GRADIENTE_SUPERIOR_DIREITO: new PortugolVar("inteiro", 6, true),
  GRADIENTE_SUPERIOR_ESQUERDO: new PortugolVar("inteiro", 7, true),

  async iniciar_modo_grafico(manter_visivel) {
    self.runtime.expectType("iniciar_modo_grafico", "manter_visivel", manter_visivel, "logico");

    // Chamado de novo, o Portugol Studio reaproveita a janela: volta ao tamanho
    // e ao título padrão em vez de abrir outra
    if (self.graphics?.initialized) {
      if (!self.graphics.fullscreen) {
        self.graphics.resize(640, 480);
      }

      await self.runtime.postMessageAndWaitForResponse({
        type: "graphics.setWindowTitle",
        data: {
          title: "",
        },
      });

      return;
    }

    const canvas = await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.create",
    });

    const graphics = self.runtime.getGraphicsContext();
    graphics.init(canvas);
    graphics.initialized = true;

    // Como no Portugol Studio, a janela sempre abre com 640x480
    graphics.resize(640, 480);
  },

  async encerrar_modo_grafico() {
    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.destroy",
    });

    // Como no Portugol Studio, a cor, a fonte e o resto continuam valendo
    // se o modo gráfico for iniciado de novo
    self.graphics.initialized = false;
    self.graphics.fullscreen = false;
  },

  async fechar_janela() {
    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.closeWindow",
    });
  },

  async ocultar_borda_janela() {
    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.hideWindowBorder",
    });
  },

  async exibir_borda_janela() {
    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.showWindow",
    });
  },

  async minimizar_janela() {
    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.minimizeWindow",
    });
  },

  async restaurar_janela() {
    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.restoreWindow",
    });
  },

  async definir_dimensoes_janela(largura, altura) {
    self.runtime.expectType("definir_dimensoes_janela", "largura", largura, "inteiro");
    self.runtime.expectType("definir_dimensoes_janela", "altura", altura, "inteiro");

    self.runtime.assertGraphicsContext();

    // Como no Portugol Studio, o tamanho não muda em tela cheia
    if (self.graphics.fullscreen) {
      return;
    }

    const width = Math.round(largura.getValue());
    const height = Math.round(altura.getValue());

    self.graphics.resize(width, height);

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.setWindowSize",
      data: {
        width,
        height,
      },
    });
  },

  async definir_titulo_janela(titulo) {
    self.runtime.expectType("definir_titulo_janela", "titulo", titulo, "cadeia");

    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.setWindowTitle",
      data: {
        title: titulo.getValue(),
      },
    });
  },

  // A janela ocupa a aba do navegador: o modo tela cheia de verdade só pode
  // ser pedido num clique ou numa tecla do usuário
  async entrar_modo_tela_cheia() {
    self.runtime.assertGraphicsContext();

    if (self.graphics.fullscreen) {
      return;
    }

    self.graphics.sizeBeforeFullscreen = {
      width: self.graphics.getWidth(),
      height: self.graphics.getHeight(),
    };

    const size = await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.enterFullscreen",
    });

    self.graphics.resize(size.width, size.height);
    self.graphics.fullscreen = true;
  },

  async sair_modo_tela_cheia() {
    self.runtime.assertGraphicsContext();

    if (!self.graphics.fullscreen) {
      return;
    }

    self.graphics.fullscreen = false;

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.exitFullscreen",
    });

    const { width, height } = self.graphics.sizeBeforeFullscreen;
    self.graphics.resize(width, height);
  },

  largura_janela() {
    self.runtime.assertGraphicsContext();
    return new PortugolVar("inteiro", self.graphics.getWidth(), true);
  },

  altura_janela() {
    self.runtime.assertGraphicsContext();
    return new PortugolVar("inteiro", self.graphics.getHeight(), true);
  },

  async largura_tela() {
    const result = await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.getScreenInfo",
    });

    return new PortugolVar("inteiro", result.width, true);
  },

  async altura_tela() {
    const result = await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.getScreenInfo",
    });

    return new PortugolVar("inteiro", result.height, true);
  },

  largura_texto(texto) {
    self.runtime.expectType("largura_texto", "texto", texto, "cadeia");
    self.runtime.assertGraphicsSurface();

    const size = self.graphics.calculateTextSize(texto.getValue(), true);
    return new PortugolVar("inteiro", Math.round(size.width), true);
  },

  altura_texto(texto) {
    self.runtime.expectType("altura_texto", "texto", texto, "cadeia");
    self.runtime.assertGraphicsSurface();

    const size = self.graphics.calculateTextSize(texto.getValue(), true);
    return new PortugolVar("inteiro", size.height, true);
  },

  async renderizar() {
    self.runtime.assertGraphicsSurface();
    await self.graphics.render();
  },

  criar_cor(r, g, b) {
    self.runtime.expectType("criar_cor", "vermelho", r, "inteiro");
    self.runtime.expectType("criar_cor", "verde", g, "inteiro");
    self.runtime.expectType("criar_cor", "azul", b, "inteiro");

    const vermelho = r.getValue();
    const verde = g.getValue();
    const azul = b.getValue();

    if (vermelho < 0 || vermelho > 255 || verde < 0 || verde > 255 || azul < 0 || azul > 255) {
      throw new Error("Erro ao criar a cor, os valor dos tons deve estar entre 0 e 255");
    }

    const alpha = 255;
    const value = ((alpha & 0xFF) << 24) |
      ((vermelho & 0xFF) << 16) |
      ((verde & 0xFF) << 8) |
      ((azul & 0xFF) << 0);

    return new PortugolVar("inteiro", value, true);
  },

  definir_cor(cor) {
    self.runtime.expectType("definir_cor", "cor", cor, "inteiro");
    self.runtime.getGraphicsContext();

    self.graphics.setWorkingColor(
      Math.round(cor.getValue())
    );
  },

  obter_RGB(cor, canal) {
    self.runtime.expectType("obter_RGB", "cor", cor, "inteiro");
    self.runtime.expectType("obter_RGB", "canal", canal, "inteiro");

    const color = Math.round(cor.getValue());
    const channel = canal.getValue();

    switch (channel) {
      case 0: return new PortugolVar("inteiro", (color >> 16) & 0xFF, true);
      case 1: return new PortugolVar("inteiro", (color >> 8) & 0xFF, true);
      case 2: return new PortugolVar("inteiro", color & 0xFF, true);
      default: return new PortugolVar("inteiro", 0, true);
    }
  },

  definir_gradiente(tipo, cor1, cor2) {
    self.runtime.expectType("definir_gradiente", "tipo", tipo, "inteiro");
    self.runtime.expectType("definir_gradiente", "cor1", cor1, "inteiro");
    self.runtime.expectType("definir_gradiente", "cor2", cor2, "inteiro");

    self.runtime.getGraphicsContext();

    self.graphics.setWorkingGradient(
      tipo.getValue(),
      Math.round(cor1.getValue()),
      Math.round(cor2.getValue())
    );
  },

  definir_opacidade(opacidade) {
    self.runtime.expectType("definir_opacidade", "opacidade", opacidade, "inteiro");
    self.runtime.getGraphicsContext();

    if (opacidade.getValue() < 0 || opacidade.getValue() > 255) {
      throw new Error("O valor da opacidade deve esta entre 0 e 255");
    }

    self.graphics.setWorkingOpacity(opacidade.getValue());
  },

  definir_estilo_texto(italico, negrito, sublinhado) {
    self.runtime.expectType("definir_estilo_texto", "italico", italico, "logico");
    self.runtime.expectType("definir_estilo_texto", "negrito", negrito, "logico");
    self.runtime.expectType("definir_estilo_texto", "sublinhado", sublinhado, "logico");

    self.runtime.assertGraphicsSurface();

    self.graphics.setWorkingTextStyle(
      italico.getValue(),
      negrito.getValue(),
      sublinhado.getValue()
    );
  },

  definir_tamanho_texto(tamanho) {
    self.runtime.expectType("definir_tamanho_texto", "tamanho", tamanho, "inteiro", "real");
    self.runtime.assertGraphicsSurface();
    self.graphics.setWorkingTextSize(tamanho.getValue());
  },

  definir_fonte_texto(fonte) {
    self.runtime.expectType("definir_fonte_texto", "nome", fonte, "cadeia");
    self.runtime.assertGraphicsSurface();
    self.graphics.setWorkingFont(fonte.getValue());
  },

  definir_rotacao(rotacao) {
    self.runtime.expectType("definir_rotacao", "rotacao", rotacao, "inteiro");
    self.runtime.getGraphicsContext();
    self.graphics.setWorkingRotation(rotacao.getValue());
  },

  limpar() {
    self.runtime.assertGraphicsSurface();
    self.graphics.clearRender();
  },

  desenhar_retangulo(x, y, largura, altura, arredondar_cantos, preencher) {
    self.runtime.expectType("desenhar_retangulo", "x", x, "inteiro");
    self.runtime.expectType("desenhar_retangulo", "y", y, "inteiro");
    self.runtime.expectType("desenhar_retangulo", "largura", largura, "inteiro");
    self.runtime.expectType("desenhar_retangulo", "altura", altura, "inteiro");
    self.runtime.expectType("desenhar_retangulo", "arredondar_cantos", arredondar_cantos, "logico");
    self.runtime.expectType("desenhar_retangulo", "preencher", preencher, "logico");

    self.runtime.getGraphicsContext();

    self.graphics.drawRect(x.getValue(), y.getValue(), largura.getValue(), altura.getValue(), arredondar_cantos.getValue(), preencher.getValue());
  },

  desenhar_elipse(x, y, largura, altura, preencher) {
    self.runtime.expectType("desenhar_elipse", "x", x, "inteiro");
    self.runtime.expectType("desenhar_elipse", "y", y, "inteiro");
    self.runtime.expectType("desenhar_elipse", "largura", largura, "inteiro");
    self.runtime.expectType("desenhar_elipse", "altura", altura, "inteiro");
    self.runtime.expectType("desenhar_elipse", "preencher", preencher, "logico");

    self.runtime.getGraphicsContext();

    self.graphics.drawEllipse(x.getValue(), y.getValue(), largura.getValue(), altura.getValue(), preencher.getValue());
  },

  desenhar_ponto(x, y) {
    self.runtime.expectType("desenhar_ponto", "x", x, "inteiro");
    self.runtime.expectType("desenhar_ponto", "y", y, "inteiro");

    self.runtime.getGraphicsContext();

    self.graphics.drawPoint(x.getValue(), y.getValue());
  },

  desenhar_poligono(pontos, preencher) {
    self.runtime.expectType("desenhar_poligono", "pontos", pontos, "matriz");
    self.runtime.expectType("desenhar_poligono", "preencher", preencher, "logico");

    self.runtime.getGraphicsContext();

    // Os pontos são copiados agora: a matriz pode mudar antes do 'renderizar'
    const pontosCopiados = pontos.getValue().map((ponto) =>
      Array.from(ponto, (coordenada) => coordenada instanceof PortugolVar ? coordenada.value : coordenada)
    );

    self.graphics.drawPolygon(pontosCopiados, preencher.getValue());
  },

  desenhar_texto(x, y, texto) {
    self.runtime.expectType("desenhar_texto", "x", x, "inteiro");
    self.runtime.expectType("desenhar_texto", "y", y, "inteiro");
    self.runtime.expectType("desenhar_texto", "texto", texto, "cadeia");

    self.runtime.getGraphicsContext();

    self.graphics.drawText(x.getValue(), y.getValue(), texto.getValue());
  },

  desenhar_linha(x1, y1, x2, y2) {
    self.runtime.expectType("desenhar_linha", "x1", x1, "inteiro");
    self.runtime.expectType("desenhar_linha", "y1", y1, "inteiro");
    self.runtime.expectType("desenhar_linha", "x2", x2, "inteiro");
    self.runtime.expectType("desenhar_linha", "y2", y2, "inteiro");

    self.runtime.getGraphicsContext();

    self.graphics.drawLine(x1.getValue(), y1.getValue(), x2.getValue(), y2.getValue());
  },

  altura_imagem(endereco) {
    self.runtime.expectType("altura_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("altura_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  largura_imagem(endereco) {
    self.runtime.expectType("largura_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("largura_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  carregar_fonte(caminho_fonte) {
    self.runtime.expectType("carregar_fonte", "caminho_fonte", caminho_fonte, "cadeia");
    self.runtime.unimplementedMethod("carregar_fonte", "Graficos");
  },

  carregar_imagem(caminho) {
    self.runtime.expectType("carregar_imagem", "caminho", caminho, "cadeia");
    self.runtime.unimplementedMethod("carregar_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  salvar_imagem(endereco, caminho) {
    self.runtime.expectType("salvar_imagem", "endereco", endereco, "inteiro");
    self.runtime.expectType("salvar_imagem", "caminho", caminho, "cadeia");
    self.runtime.unimplementedMethod("salvar_imagem", "Graficos");
  },

  liberar_imagem(endereco) {
    self.runtime.expectType("liberar_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("liberar_imagem", "Graficos");
  },

  definir_icone_janela(endereco) {
    self.runtime.expectType("definir_icone_janela", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("definir_icone_janela", "Graficos");
  },

  definir_quadro_gif(endereco, quadro) {
    self.runtime.expectType("definir_quadro_gif", "endereco", endereco, "inteiro");
    self.runtime.expectType("definir_quadro_gif", "quadro", quadro, "inteiro");
    self.runtime.unimplementedMethod("definir_quadro_gif", "Graficos");
  },

  desenhar_imagem(x, y, endereco) {
    self.runtime.expectType("desenhar_imagem", "x", x, "inteiro");
    self.runtime.expectType("desenhar_imagem", "y", y, "inteiro");
    self.runtime.expectType("desenhar_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("desenhar_imagem", "Graficos");
  },

  desenhar_porcao_imagem(x, y, xi, yi, largura, altura, endereco) {
    self.runtime.expectType("desenhar_porcao_imagem", "x", x, "inteiro");
    self.runtime.expectType("desenhar_porcao_imagem", "y", y, "inteiro");
    self.runtime.expectType("desenhar_porcao_imagem", "xi", xi, "inteiro");
    self.runtime.expectType("desenhar_porcao_imagem", "yi", yi, "inteiro");
    self.runtime.expectType("desenhar_porcao_imagem", "largura", largura, "inteiro");
    self.runtime.expectType("desenhar_porcao_imagem", "altura", altura, "inteiro");
    self.runtime.expectType("desenhar_porcao_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("desenhar_porcao_imagem", "Graficos");
  },

  desenhar_quadro_atual_gif(x, y, endereco) {
    self.runtime.expectType("desenhar_quadro_atual_gif", "x", x, "inteiro");
    self.runtime.expectType("desenhar_quadro_atual_gif", "y", y, "inteiro");
    self.runtime.expectType("desenhar_quadro_atual_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("desenhar_quadro_atual_gif", "Graficos");
  },

  obter_cor_pixel(endereco, x, y) {
    self.runtime.expectType("obter_cor_pixel", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_cor_pixel", "x", x, "inteiro");
    self.runtime.expectType("obter_cor_pixel", "y", y, "inteiro");
    self.runtime.unimplementedMethod("obter_cor_pixel", "Graficos");
    return new PortugolVar("inteiro", -16777216, true);
  },

  obter_intervalo_gif(endereco) {
    self.runtime.expectType("obter_intervalo_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("obter_intervalo_gif", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  obter_numero_quadro_atual_gif(endereco) {
    self.runtime.expectType("obter_numero_quadro_atual_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("obter_numero_quadro_atual_gif", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  obter_numero_quadros_gif(endereco) {
    self.runtime.expectType("obter_numero_quadros_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("obter_numero_quadros_gif", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  obter_quadro_gif(endereco, quadro) {
    self.runtime.expectType("obter_quadro_gif", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_quadro_gif", "quadro", quadro, "inteiro");
    self.runtime.unimplementedMethod("obter_quadro_gif", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  proximo_frame_gif(endereco) {
    self.runtime.expectType("proximo_frame_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("proximo_frame_gif", "Graficos");
  },

  redimensionar_imagem(endereco, largura, altura, manter_qualidade) {
    self.runtime.expectType("redimensionar_imagem", "endereco", endereco, "inteiro");
    self.runtime.expectType("redimensionar_imagem", "largura", largura, "inteiro");
    self.runtime.expectType("redimensionar_imagem", "altura", altura, "inteiro");
    self.runtime.expectType("redimensionar_imagem", "manter_qualidade", manter_qualidade, "logico");
    self.runtime.unimplementedMethod("redimensionar_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  renderizar_imagem(largura, altura) {
    self.runtime.expectType("renderizar_imagem", "largura", largura, "inteiro");
    self.runtime.expectType("renderizar_imagem", "altura", altura, "inteiro");
    self.runtime.unimplementedMethod("renderizar_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  transformar_imagem(endereco, espelhamento_horizontal, espelhamento_vertical, rotacao, cor_transparente) {
    self.runtime.expectType("transformar_imagem", "endereco", endereco, "inteiro");
    self.runtime.expectType("transformar_imagem", "espelhamento_horizontal", espelhamento_horizontal, "logico");
    self.runtime.expectType("transformar_imagem", "espelhamento_vertical", espelhamento_vertical, "logico");
    self.runtime.expectType("transformar_imagem", "rotacao", rotacao, "inteiro");
    self.runtime.expectType("transformar_imagem", "cor_transparente", cor_transparente, "inteiro");
    self.runtime.unimplementedMethod("transformar_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },

  transformar_porcao_imagem(endereco, x, y, largura, altura, espelhamento_horizontal, espelhamento_vertical, rotacao, cor_transparente) {
    self.runtime.expectType("transformar_porcao_imagem", "endereco", endereco, "inteiro");
    self.runtime.expectType("transformar_porcao_imagem", "x", x, "inteiro");
    self.runtime.expectType("transformar_porcao_imagem", "y", y, "inteiro");
    self.runtime.expectType("transformar_porcao_imagem", "largura", largura, "inteiro");
    self.runtime.expectType("transformar_porcao_imagem", "altura", altura, "inteiro");
    self.runtime.expectType("transformar_porcao_imagem", "espelhamento_horizontal", espelhamento_horizontal, "logico");
    self.runtime.expectType("transformar_porcao_imagem", "espelhamento_vertical", espelhamento_vertical, "logico");
    self.runtime.expectType("transformar_porcao_imagem", "rotacao", rotacao, "inteiro");
    self.runtime.expectType("transformar_porcao_imagem", "cor_transparente", cor_transparente, "inteiro");
    self.runtime.unimplementedMethod("transformar_porcao_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, true);
  },
}`;
