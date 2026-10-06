/**
 * Este exemplo demonstra como utilizar a função "botao_pressionado" da biblioteca
 * "Mouse" para saber quais botões do mouse estão pressionados em cada instante.
 * Enquanto um botão estiver pressionado, o retângulo correspondente fica verde.
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
    g.definir_titulo_janela("Botões pressionados")

    enquanto (nao t.tecla_pressionada(t.TECLA_ESC)) {
      g.definir_cor(g.COR_PRETO)
      g.limpar()

      // A função "botao_pressionado" testa o botão informado neste instante,
      // por isso o teste é repetido a cada passagem pelo laço
      desenhar_botao(40, "Esquerdo", m.botao_pressionado(m.BOTAO_ESQUERDO))
      desenhar_botao(190, "Meio", m.botao_pressionado(m.BOTAO_MEIO))
      desenhar_botao(340, "Direito", m.botao_pressionado(m.BOTAO_DIREITO))

      // A função "algum_botao_pressionado" testa todos os botões de uma vez
      g.definir_cor(g.COR_BRANCO)

      se (m.algum_botao_pressionado()) {
        g.desenhar_texto(40, 300, "Há algum botão pressionado")
      } senao {
        g.desenhar_texto(40, 300, "Nenhum botão pressionado")
      }

      g.desenhar_texto(40, 360, "Pressione ESC para sair")

      g.renderizar()
      u.aguarde(10)
    }

    g.encerrar_modo_grafico()
  }

  funcao desenhar_botao(inteiro x, cadeia nome, logico pressionado) {
    se (pressionado) {
      g.definir_cor(g.COR_VERDE)
    } senao {
      g.definir_cor(g.criar_cor(80, 80, 80))
    }

    g.desenhar_retangulo(x, 100, 120, 120, verdadeiro, verdadeiro)

    g.definir_cor(g.COR_BRANCO)
    g.desenhar_texto(x + 10, 240, nome)
  }
}
