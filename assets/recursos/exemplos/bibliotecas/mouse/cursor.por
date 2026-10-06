/**
 * Este exemplo demonstra como utilizar as funções "ocultar_cursor" e "exibir_cursor"
 * da biblioteca "Mouse". Enquanto o botão esquerdo estiver pressionado, o cursor do
 * mouse fica oculto e um quadrado é desenhado em seu lugar.
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
    g.definir_titulo_janela("Cursor do mouse")

    logico cursor_oculto = falso

    enquanto (nao t.tecla_pressionada(t.TECLA_ESC)) {
      g.definir_cor(g.COR_PRETO)
      g.limpar()

      se (m.botao_pressionado(m.BOTAO_ESQUERDO)) {
        // Oculta o cursor apenas uma vez, quando o botão começa a ser pressionado
        se (nao cursor_oculto) {
          m.ocultar_cursor()
          cursor_oculto = verdadeiro
        }

        // Desenha um quadrado no lugar do cursor
        g.definir_cor(g.COR_VERMELHO)
        g.desenhar_retangulo(m.posicao_x() - 10, m.posicao_y() - 10, 20, 20, falso, verdadeiro)
      } senao se (cursor_oculto) {
        // Exibe o cursor novamente quando o botão é solto
        m.exibir_cursor()
        cursor_oculto = falso
      }

      g.definir_cor(g.COR_BRANCO)
      g.desenhar_texto(10, 10, "Mantenha o botão esquerdo pressionado para ocultar o cursor")
      g.desenhar_texto(10, 380, "Pressione ESC para sair")

      g.renderizar()
      u.aguarde(10)
    }

    m.exibir_cursor()
    g.encerrar_modo_grafico()
  }
}
