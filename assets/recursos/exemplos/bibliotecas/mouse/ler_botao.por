/**
 * Este exemplo demonstra como utilizar a função "ler_botao" da biblioteca "Mouse".
 * Diferente da função "botao_pressionado", a função "ler_botao" pausa o programa até
 * que um botão do mouse seja clicado (pressionado e solto) e retorna o código desse botão.
 *
 * A biblioteca "Mouse" só funciona com o modo gráfico iniciado.
 *
 * Clique 5 vezes na janela para encerrar o programa.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Mouse --> m
  inclua biblioteca Util --> u

  funcao inicio() {
    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(500, 400)
    g.definir_titulo_janela("Ler botão")

    cadeia mensagem = "Clique com qualquer botão do mouse"

    para (inteiro cliques = 1; cliques <= 5; cliques++) {
      g.definir_cor(g.COR_PRETO)
      g.limpar()

      g.definir_cor(g.COR_BRANCO)
      g.desenhar_texto(40, 160, mensagem)
      g.desenhar_texto(40, 200, "Clique " + cliques + " de 5")
      g.renderizar()

      // O programa fica parado nesta linha até que um botão seja clicado
      inteiro botao = m.ler_botao()

      se (botao == m.BOTAO_ESQUERDO) {
        mensagem = "Você clicou com o botão esquerdo"
      } senao se (botao == m.BOTAO_DIREITO) {
        mensagem = "Você clicou com o botão direito"
      } senao se (botao == m.BOTAO_MEIO) {
        mensagem = "Você clicou com o botão do meio"
      }
    }

    g.encerrar_modo_grafico()
  }
}
