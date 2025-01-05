export default /* javascript */ `{
  CANAL_R: new PortugolVar("inteiro", 0, false, true),
  CANAL_G: new PortugolVar("inteiro", 1, false, true),
  CANAL_B: new PortugolVar("inteiro", 2, false, true),

  COR_AMARELO: new PortugolVar("inteiro", -256, false, true),
  COR_AZUL: new PortugolVar("inteiro", -16776961, false, true),
  COR_BRANCO: new PortugolVar("inteiro", -1, false, true),
  COR_PRETO: new PortugolVar("inteiro", -16777216, false, true),
  COR_VERMELHO: new PortugolVar("inteiro", -65536, false, true),

  GRADIENTE_DIREITA: new PortugolVar("inteiro", 0, false, true),
  GRADIENTE_ESQUERDA: new PortugolVar("inteiro", 1, false, true),
  GRADIENTE_ACIMA: new PortugolVar("inteiro", 2, false, true),
  GRADIENTE_ABAIXO: new PortugolVar("inteiro", 3, false, true),
  GRADIENTE_INFERIOR_DIREITO: new PortugolVar("inteiro", 4, false, true),
  GRADIENTE_INFERIOR_ESQUERDO: new PortugolVar("inteiro", 5, false, true),
  GRADIENTE_SUPERIOR_DIREITO: new PortugolVar("inteiro", 6, false, true),
  GRADIENTE_SUPERIOR_ESQUERDO: new PortugolVar("inteiro", 7, false, true),

  iniciar_modo_grafico(manter_visivel) {
    self.runtime.expectType("iniciar_modo_grafico", "manter_visivel", manter_visivel, "logico");
    self.postMessage({ type: "graphics", func: "init", args: [manter_visivel.value] });
  },

  encerrar_modo_grafico() {
    self.postMessage({ type: "graphics", func: "destroy", args: [] });
  },

  fechar_janela() {
    self.postMessage({ type: "graphics", func: "closeWindow", args: [] });
  },

  exibir_borda_janela() {
    self.postMessage({ type: "graphics", func: "showWindow", args: [] });
  },

  minimizar_janela() {
    self.postMessage({ type: "graphics", func: "minimizeWindow", args: [] });
  },

  restaurar_janela() {
    self.postMessage({ type: "graphics", func: "restoreWindow", args: [] });
  },

  definir_dimensoes_janela(largura, altura) {
    self.runtime.expectType("definir_dimensoes_janela", "largura", largura, "inteiro");
    self.runtime.expectType("definir_dimensoes_janela", "altura", altura, "inteiro");
    self.postMessage({ type: "graphics", func: "resize", args: [largura.value, altura.value] });
  },

  definir_titulo_janela(titulo) {
    self.runtime.expectType("definir_titulo_janela", "titulo", titulo, "cadeia");
    self.postMessage({ type: "graphics", func: "setWindowTitle", args: [titulo.value] });
  },

  entrar_modo_tela_cheia() {
    self.postMessage({ type: "graphics", func: "enterFullscreen", args: [] });
  },

  sair_modo_tela_cheia() {
    self.postMessage({ type: "graphics", func: "exitFullscreen", args: [] });
  },

  async renderizar() {
    self.postMessage({ type: "graphics", func: "render", args: [] });
    await self.runtime.waitForResponse("graphics-rendered");
  },

  criar_cor(r, g, b) {
    self.runtime.expectType("criar_cor", "r", r, "inteiro");
    self.runtime.expectType("criar_cor", "g", g, "inteiro");
    self.runtime.expectType("criar_cor", "b", b, "inteiro");

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error("Erro ao criar a cor, os valor dos tons deve estar entre 0 e 255");
    }

    return new PortugolVar("inteiro", (r.value << 16) + (g.value << 8) + b.value, false, true);
  },

  definir_cor(cor) {
    self.runtime.expectType("definir_cor", "cor", cor, "inteiro");
    self.postMessage({ type: "graphics", func: "setWorkingColor", args: [cor.value] });
  },

  limpar() {
    self.postMessage({ type: "graphics", func: "clearRender", args: [] });
  },

  desenhar_retangulo(x, y, largura, altura, arrendodar_cantos, preencher) {
    self.runtime.expectType("desenhar_retangulo", "x", x, "inteiro");
    self.runtime.expectType("desenhar_retangulo", "y", y, "inteiro");
    self.runtime.expectType("desenhar_retangulo", "largura", largura, "inteiro");
    self.runtime.expectType("desenhar_retangulo", "altura", altura, "inteiro");
    self.runtime.expectType("desenhar_retangulo", "arrendodar_cantos", arrendodar_cantos, "logico");
    self.runtime.expectType("desenhar_retangulo", "preencher", preencher, "logico");

    self.postMessage({ type: "graphics", func: "drawRect", args: [x.value, y.value, largura.value, altura.value, arrendodar_cantos.value, preencher.value] });
  },
}`;
