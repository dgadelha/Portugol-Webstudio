/**
 * Este exemplo demonstra como utilizar as funções "posicao_x" e "posicao_y" da
 * biblioteca "Mouse" para obter a posição do cursor do mouse. Um círculo acompanha o
 * cursor e as coordenadas são exibidas na janela.
 *
 * A biblioteca "Mouse" só funciona com o modo gráfico iniciado.
 *
 * Pressione ESC para encerrar o programa.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Mouse --> m
  inclua biblioteca Teclado --> t
  inclua biblioteca Util --> u

  funcao inicio() {
    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(500, 400)
    g.definir_titulo_janela("Posição do mouse")

    enquanto (nao t.tecla_pressionada(t.TECLA_ESC)) {
      // Obtém as coordenadas do cursor do mouse dentro da janela
      inteiro x = m.posicao_x()
      inteiro y = m.posicao_y()

      g.definir_cor(g.COR_PRETO)
      g.limpar()

      // Desenha um círculo centralizado na posição do cursor
      g.definir_cor(g.COR_AMARELO)
      g.desenhar_elipse(x - 15, y - 15, 30, 30, verdadeiro)

      g.definir_cor(g.COR_BRANCO)
      g.desenhar_texto(10, 10, "X: " + x + "   Y: " + y)
      g.desenhar_texto(10, 380, "Pressione ESC para sair")

      g.renderizar()
      u.aguarde(10)
    }

    g.encerrar_modo_grafico()
  }
}
