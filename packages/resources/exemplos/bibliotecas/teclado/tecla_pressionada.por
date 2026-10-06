/**
 * Este exemplo demonstra como utilizar a função "tecla_pressionada" da biblioteca
 * "Teclado" para mover um quadrado pela janela com as setas do teclado. Diferente da
 * função "ler_tecla", a função "tecla_pressionada" não pausa o programa: ela apenas
 * testa se uma tecla está pressionada naquele instante, o que permite movimentos contínuos.
 *
 * A biblioteca "Teclado" só funciona com o modo gráfico iniciado.
 *
 * Pressione ESC para encerrar o programa.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Teclado --> t
  inclua biblioteca Util --> u

  const inteiro LARGURA = 500
  const inteiro ALTURA = 400
  const inteiro TAMANHO = 40
  const inteiro VELOCIDADE = 4

  funcao inicio() {
    inteiro x = (LARGURA - TAMANHO) / 2
    inteiro y = (ALTURA - TAMANHO) / 2

    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(LARGURA, ALTURA)
    g.definir_titulo_janela("Tecla pressionada")

    enquanto (nao t.tecla_pressionada(t.TECLA_ESC)) {
      // Cada seta é testada separadamente, então é possível mover o quadrado
      // na diagonal pressionando duas setas ao mesmo tempo
      se (t.tecla_pressionada(t.TECLA_SETA_ESQUERDA) e x > 0) {
        x = x - VELOCIDADE
      }

      se (t.tecla_pressionada(t.TECLA_SETA_DIREITA) e x < LARGURA - TAMANHO) {
        x = x + VELOCIDADE
      }

      se (t.tecla_pressionada(t.TECLA_SETA_ACIMA) e y > 0) {
        y = y - VELOCIDADE
      }

      se (t.tecla_pressionada(t.TECLA_SETA_ABAIXO) e y < ALTURA - TAMANHO) {
        y = y + VELOCIDADE
      }

      g.definir_cor(g.COR_PRETO)
      g.limpar()

      g.definir_cor(g.COR_VERDE)
      g.desenhar_retangulo(x, y, TAMANHO, TAMANHO, falso, verdadeiro)

      g.definir_cor(g.COR_BRANCO)
      g.desenhar_texto(10, 10, "Use as setas para mover o quadrado e ESC para sair")

      g.renderizar()
      u.aguarde(10)
    }

    g.encerrar_modo_grafico()
  }
}
