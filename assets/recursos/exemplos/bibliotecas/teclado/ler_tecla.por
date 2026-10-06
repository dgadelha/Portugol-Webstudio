/**
 * Este exemplo demonstra como utilizar as funções "ler_tecla" e "caracter_tecla" da
 * biblioteca "Teclado". A função "ler_tecla" pausa o programa até que uma tecla seja
 * digitada (pressionada e solta) e retorna o código dessa tecla. A função
 * "caracter_tecla" obtém o caractere correspondente a um código de tecla.
 *
 * A biblioteca "Teclado" só funciona com o modo gráfico iniciado.
 *
 * Pressione ESC para encerrar o programa.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Teclado --> t

  funcao inicio() {
    inteiro tecla = 0
    cadeia digitado = ""

    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(500, 300)
    g.definir_titulo_janela("Ler tecla")

    faca {
      g.definir_cor(g.COR_PRETO)
      g.limpar()

      g.definir_cor(g.COR_BRANCO)
      g.desenhar_texto(20, 20, "Digite algumas letras (ESC para sair):")
      g.desenhar_texto(20, 60, digitado)
      g.desenhar_texto(20, 100, "Código da última tecla: " + tecla)
      g.renderizar()

      // O programa fica parado nesta linha até que uma tecla seja digitada
      tecla = t.ler_tecla()

      // Converte o código da tecla no caractere correspondente
      se (tecla >= t.TECLA_A e tecla <= t.TECLA_Z) {
        digitado = digitado + t.caracter_tecla(tecla)
      }
    } enquanto (tecla != t.TECLA_ESC)

    g.encerrar_modo_grafico()
  }
}
