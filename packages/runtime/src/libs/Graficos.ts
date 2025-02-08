export default /* javascript */ `{
  CANAL_R: new PortugolVar("inteiro", 0, false, true),
  CANAL_G: new PortugolVar("inteiro", 1, false, true),
  CANAL_B: new PortugolVar("inteiro", 2, false, true),

  COR_AMARELO: new PortugolVar("inteiro", -256, false, true),
  COR_AZUL: new PortugolVar("inteiro", -16776961, false, true),
  COR_BRANCO: new PortugolVar("inteiro", -1, false, true),
  COR_PRETO: new PortugolVar("inteiro", -16777216, false, true),
  COR_VERMELHO: new PortugolVar("inteiro", -65536, false, true),
  COR_VERDE: new PortugolVar("inteiro", -16711936, false, true),

  GRADIENTE_DIREITA: new PortugolVar("inteiro", 0, false, true),
  GRADIENTE_ESQUERDA: new PortugolVar("inteiro", 1, false, true),
  GRADIENTE_ACIMA: new PortugolVar("inteiro", 2, false, true),
  GRADIENTE_ABAIXO: new PortugolVar("inteiro", 3, false, true),
  GRADIENTE_INFERIOR_DIREITO: new PortugolVar("inteiro", 4, false, true),
  GRADIENTE_INFERIOR_ESQUERDO: new PortugolVar("inteiro", 5, false, true),
  GRADIENTE_SUPERIOR_DIREITO: new PortugolVar("inteiro", 6, false, true),
  GRADIENTE_SUPERIOR_ESQUERDO: new PortugolVar("inteiro", 7, false, true),

  async iniciar_modo_grafico(manter_visivel) {
    self.runtime.expectType("iniciar_modo_grafico", "manter_visivel", manter_visivel, "logico");

    const canvas = await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.create",
    });

    if (!self.graphics) {
      self.graphics = new PortugolGraphicsContext();
    }

    self.graphics.init(canvas);
  },

  async encerrar_modo_grafico() {
    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.destroy",
    });

    if (self.graphics) {
      self.graphics = null;
    }
  },

  async fechar_janela() {
    self.runtime.assertGraphicsContext();

    await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.closeWindow",
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

    await self.runtime.waitForResponse({
      type: "graphics.restoreWindow",
    });
  },

  async definir_dimensoes_janela(largura, altura) {
    self.runtime.expectType("definir_dimensoes_janela", "largura", largura, "inteiro", "real");
    self.runtime.expectType("definir_dimensoes_janela", "altura", altura, "inteiro", "real");

    self.runtime.assertGraphicsContext();

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

  entrar_modo_tela_cheia() {
    self.runtime.assertGraphicsContext();

    self.runtime.postMessageAndWaitForResponse({
      type: "graphics.enterFullscreen",
    });
  },

  sair_modo_tela_cheia() {
    self.runtime.assertGraphicsContext();

    self.runtime.postMessageAndWaitForResponse({
      type: "graphics.exitFullscreen",
    });
  },

  largura_janela() {
    self.runtime.assertGraphicsContext();
    return new PortugolVar("inteiro", self.graphics.getWidth(), false, true);
  },

  altura_janela() {
    self.runtime.assertGraphicsContext();
    return new PortugolVar("inteiro", self.graphics.getHeight(), false, true);
  },

  async largura_tela() {
    const result = await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.getScreenInfo",
    });

    return new PortugolVar("inteiro", result.width, false, true);
  },

  async altura_tela() {
    const result = await self.runtime.postMessageAndWaitForResponse({
      type: "graphics.getScreenInfo",
    });

    return new PortugolVar("inteiro", result.height, false, true);
  },

  largura_texto(texto) {
    self.runtime.expectType("largura_texto", "texto", texto, "cadeia");
    self.runtime.assertGraphicsContext();

    const size = self.graphics.calculateTextSize(texto.getValue());
    return new PortugolVar("inteiro", size.width, false, true);
  },

  altura_texto(texto) {
    self.runtime.expectType("altura_texto", "texto", texto, "cadeia");
    self.runtime.assertGraphicsContext();

    const size = self.graphics.calculateTextSize(texto.getValue());
    return new PortugolVar("inteiro", size.height, false, true);
  },

  async renderizar() {
    self.runtime.assertGraphicsContext();
    await self.graphics.render();
  },

  criar_cor(r, g, b) {
    self.runtime.expectType("criar_cor", "r", r, "inteiro");
    self.runtime.expectType("criar_cor", "g", g, "inteiro");
    self.runtime.expectType("criar_cor", "b", b, "inteiro");

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error("Erro ao criar a cor, os valor dos tons deve estar entre 0 e 255");
    }

    const alpha = 255;
    const value = ((alpha & 0xFF) << 24) |
      ((r.getValue() & 0xFF) << 16) |
      ((g.getValue() & 0xFF) << 8) |
      ((b.getValue() & 0xFF) << 0);

    return new PortugolVar("inteiro", value, false, true);
  },

  definir_cor(cor) {
    self.runtime.expectType("definir_cor", "cor", cor, "inteiro", "real");
    self.runtime.assertGraphicsContext();

    self.graphics.setWorkingColor(
      Math.round(cor.getValue())
    );
  },

  obter_RGB(cor, canal) {
    self.runtime.expectType("obter_RGB", "cor", cor, "inteiro", "real");
    self.runtime.expectType("obter_RGB", "canal", canal, "inteiro");

    const color = Math.round(cor.getValue());
    const channel = canal.getValue();

    switch (channel) {
      case 0: return new PortugolVar("inteiro", (color >> 16) & 0xFF, false, true);
      case 1: return new PortugolVar("inteiro", (color >> 8) & 0xFF, false, true);
      case 2: return new PortugolVar("inteiro", color & 0xFF, false, true);
      default: throw new Error("O canal informado (" + channel + ") é inválido, o canal deve ser um dos seguintes valores: 0 (R); 1 (G); 2 (B)");
    }
  },

  definir_gradiente(tipo, cor1, cor2) {
    self.runtime.expectType("definir_gradiente", "tipo", tipo, "inteiro");
    self.runtime.expectType("definir_gradiente", "cor1", cor1, "inteiro", "real");
    self.runtime.expectType("definir_gradiente", "cor2", cor2, "inteiro", "real");

    self.runtime.assertGraphicsContext();

    self.graphics.setWorkingGradient(
      tipo.getValue(),
      Math.round(cor1.getValue()),
      Math.round(cor2.getValue())
    );
  },

  definir_opacidade(opacidade) {
    self.runtime.expectType("definir_opacidade", "opacidade", opacidade, "inteiro", "real");
    self.runtime.assertGraphicsContext();
    self.graphics.setWorkingOpacity(opacidade.getValue());
  },

  definir_estilo_texto(italico, negrito, sublinhado) {
    self.runtime.expectType("definir_estilo_texto", "italico", italico, "logico");
    self.runtime.expectType("definir_estilo_texto", "negrito", negrito, "logico");
    self.runtime.expectType("definir_estilo_texto", "sublinhado", sublinhado, "logico");

    self.runtime.assertGraphicsContext();

    self.graphics.setWorkingTextStyle(
      italico.getValue(),
      negrito.getValue(),
      sublinhado.getValue()
    );
  },

  definir_tamanho_texto(tamanho) {
    self.runtime.expectType("definir_tamanho_texto", "tamanho", tamanho, "inteiro", "real");
    self.runtime.assertGraphicsContext();
    self.graphics.setWorkingTextSize(tamanho.getValue());
  },

  definir_fonte_texto(fonte) {
    self.runtime.expectType("definir_fonte_texto", "fonte", fonte, "cadeia");
    self.runtime.assertGraphicsContext();
    self.graphics.setWorkingFont(fonte.getValue());
  },

  definir_rotacao(rotacao) {
    self.runtime.expectType("definir_rotacao", "rotacao", rotacao, "inteiro", "real");
    self.runtime.assertGraphicsContext();
    self.graphics.setWorkingRotation(rotacao.getValue());
  },

  limpar() {
    self.runtime.assertGraphicsContext();
    self.graphics.clearRender();
  },

  desenhar_retangulo(x, y, largura, altura, arrendodar_cantos, preencher) {
    self.runtime.expectType("desenhar_retangulo", "x", x, "inteiro", "real");
    self.runtime.expectType("desenhar_retangulo", "y", y, "inteiro", "real");
    self.runtime.expectType("desenhar_retangulo", "largura", largura, "inteiro", "real");
    self.runtime.expectType("desenhar_retangulo", "altura", altura, "inteiro", "real");
    self.runtime.expectType("desenhar_retangulo", "arrendodar_cantos", arrendodar_cantos, "logico");
    self.runtime.expectType("desenhar_retangulo", "preencher", preencher, "logico");

    self.runtime.assertGraphicsContext();

    self.graphics.drawRect(x.getValue(), y.getValue(), largura.getValue(), altura.getValue(), arrendodar_cantos.getValue(), preencher.getValue());
  },

  desenhar_elipse(x, y, largura, altura, preencher) {
    self.runtime.expectType("desenhar_elipse", "x", x, "inteiro", "real");
    self.runtime.expectType("desenhar_elipse", "y", y, "inteiro", "real");
    self.runtime.expectType("desenhar_elipse", "largura", largura, "inteiro", "real");
    self.runtime.expectType("desenhar_elipse", "altura", altura, "inteiro", "real");
    self.runtime.expectType("desenhar_elipse", "preencher", preencher, "logico");

    self.runtime.assertGraphicsContext();

    self.graphics.drawEllipse(x.getValue(), y.getValue(), largura.getValue(), altura.getValue(), preencher.getValue());
  },

  desenhar_ponto(x, y) {
    self.runtime.expectType("desenhar_ponto", "x", x, "inteiro", "real");
    self.runtime.expectType("desenhar_ponto", "y", y, "inteiro", "real");

    self.runtime.assertGraphicsContext();

    self.graphics.drawPoint(x.getValue(), y.getValue());
  },

  desenhar_poligono(pontos, preencher) {
    self.runtime.expectType("desenhar_poligono", "pontos", pontos, "matriz");
    self.runtime.expectType("desenhar_poligono", "preencher", preencher, "logico");

    self.runtime.assertGraphicsContext();

    self.graphics.drawPolygon(pontos.getValue(), preencher.getValue());
  },

  desenhar_texto(x, y, texto) {
    self.runtime.expectType("desenhar_texto", "x", x, "inteiro", "real");
    self.runtime.expectType("desenhar_texto", "y", y, "inteiro", "real");
    self.runtime.expectType("desenhar_texto", "texto", texto, "cadeia");

    self.runtime.assertGraphicsContext();

    self.graphics.drawText(x.getValue(), y.getValue(), texto.getValue());
  },

  desenhar_linha(x1, y1, x2, y2) {
    self.runtime.expectType("desenhar_linha", "x1", x1, "inteiro", "real");
    self.runtime.expectType("desenhar_linha", "y1", y1, "inteiro", "real");
    self.runtime.expectType("desenhar_linha", "x2", x2, "inteiro", "real");
    self.runtime.expectType("desenhar_linha", "y2", y2, "inteiro", "real");

    self.runtime.assertGraphicsContext();

    self.graphics.drawLine(x1.getValue(), y1.getValue(), x2.getValue(), y2.getValue());
  },

  altura_imagem(endereco) {
    self.runtime.expectType("altura_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("altura_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  largura_imagem(endereco) {
    self.runtime.expectType("largura_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("largura_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  carregar_fonte(caminho_fonte) {
    self.runtime.expectType("carregar_fonte", "caminho_fonte", caminho_fonte, "cadeia");
    self.runtime.unimplementedMethod("carregar_fonte", "Graficos");
  },

  carregar_imagem(caminho) {
    self.runtime.expectType("carregar_imagem", "caminho", caminho, "cadeia");
    self.runtime.unimplementedMethod("carregar_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
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
    self.runtime.expectType("desenhar_imagem", "x", x, "inteiro", "real");
    self.runtime.expectType("desenhar_imagem", "y", y, "inteiro", "real");
    self.runtime.expectType("desenhar_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("desenhar_imagem", "Graficos");
  },

  desenhar_porcao_imagem(x, y, xi, yi, largura, altura, endereco) {
    self.runtime.expectType("desenhar_porcao_imagem", "x", x, "inteiro", "real");
    self.runtime.expectType("desenhar_porcao_imagem", "y", y, "inteiro", "real");
    self.runtime.expectType("desenhar_porcao_imagem", "xi", xi, "inteiro", "real");
    self.runtime.expectType("desenhar_porcao_imagem", "yi", yi, "inteiro", "real");
    self.runtime.expectType("desenhar_porcao_imagem", "largura", largura, "inteiro", "real");
    self.runtime.expectType("desenhar_porcao_imagem", "altura", altura, "inteiro", "real");
    self.runtime.expectType("desenhar_porcao_imagem", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("desenhar_porcao_imagem", "Graficos");
  },

  desenhar_quadro_atual_gif(x, y, endereco) {
    self.runtime.expectType("desenhar_quadro_atual_gif", "x", x, "inteiro", "real");
    self.runtime.expectType("desenhar_quadro_atual_gif", "y", y, "inteiro", "real");
    self.runtime.expectType("desenhar_quadro_atual_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("desenhar_quadro_atual_gif", "Graficos");
  },

  obter_cor_pixel(endereco, x, y) {
    self.runtime.expectType("obter_cor_pixel", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_cor_pixel", "x", x, "inteiro", "real");
    self.runtime.expectType("obter_cor_pixel", "y", y, "inteiro", "real");
    self.runtime.unimplementedMethod("obter_cor_pixel", "Graficos");
    return new PortugolVar("inteiro", -16777216, false, true);
  },

  obter_intervalo_gif(endereco) {
    self.runtime.expectType("obter_intervalo_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("obter_intervalo_gif", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  obter_numero_quadro_atual_gif(endereco) {
    self.runtime.expectType("obter_numero_quadro_atual_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("obter_numero_quadro_atual_gif", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  obter_numero_quadros_gif(endereco) {
    self.runtime.expectType("obter_numero_quadros_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("obter_numero_quadros_gif", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  obter_quadro_gif(endereco, quadro) {
    self.runtime.expectType("obter_quadro_gif", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_quadro_gif", "quadro", quadro, "inteiro");
    self.runtime.unimplementedMethod("obter_quadro_gif", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  proximo_frame_gif(endereco) {
    self.runtime.expectType("proximo_frame_gif", "endereco", endereco, "inteiro");
    self.runtime.unimplementedMethod("proximo_frame_gif", "Graficos");
  },

  redimensionar_imagem(endereco, largura, altura, manter_qualidade) {
    self.runtime.expectType("redimensionar_imagem", "endereco", endereco, "inteiro");
    self.runtime.expectType("redimensionar_imagem", "largura", largura, "inteiro", "real");
    self.runtime.expectType("redimensionar_imagem", "altura", altura, "inteiro", "real");
    self.runtime.expectType("redimensionar_imagem", "manter_qualidade", manter_qualidade, "logico");
    self.runtime.unimplementedMethod("redimensionar_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  renderizar_imagem(largura, altura) {
    self.runtime.expectType("renderizar_imagem", "largura", largura, "inteiro", "real");
    self.runtime.expectType("renderizar_imagem", "altura", altura, "inteiro", "real");
    self.runtime.unimplementedMethod("renderizar_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  transformar_imagem(endereco, espelhamento_horizontal, espelhamento_vertical, rotacao, cor_transparente) {
    self.runtime.expectType("transformar_imagem", "endereco", endereco, "inteiro");
    self.runtime.expectType("transformar_imagem", "espelhamento_horizontal", espelhamento_horizontal, "logico");
    self.runtime.expectType("transformar_imagem", "espelhamento_vertical", espelhamento_vertical, "logico");
    self.runtime.expectType("transformar_imagem", "rotacao", rotacao, "inteiro", "real");
    self.runtime.expectType("transformar_imagem", "cor_transparente", cor_transparente, "inteiro");
    self.runtime.unimplementedMethod("transformar_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },

  transformar_porcao_imagem(endereco, x, y, largura, altura, espelhamento_horizontal, espelhamento_vertical, rotacao, cor_transparente) {
    self.runtime.expectType("transformar_porcao_imagem", "endereco", endereco, "inteiro");
    self.runtime.expectType("transformar_porcao_imagem", "x", x, "inteiro", "real");
    self.runtime.expectType("transformar_porcao_imagem", "y", y, "inteiro", "real");
    self.runtime.expectType("transformar_porcao_imagem", "largura", largura, "inteiro", "real");
    self.runtime.expectType("transformar_porcao_imagem", "altura", altura, "inteiro", "real");
    self.runtime.expectType("transformar_porcao_imagem", "espelhamento_horizontal", espelhamento_horizontal, "logico");
    self.runtime.expectType("transformar_porcao_imagem", "espelhamento_vertical", espelhamento_vertical, "logico");
    self.runtime.expectType("transformar_porcao_imagem", "rotacao", rotacao, "inteiro", "real");
    self.runtime.expectType("transformar_porcao_imagem", "cor_transparente", cor_transparente, "inteiro");
    self.runtime.unimplementedMethod("transformar_porcao_imagem", "Graficos");
    return new PortugolVar("inteiro", 0, false, true);
  },
}`;
