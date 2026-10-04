/**
 * Este exemplo anima uma bola que quica nas bordas da janela. Ele mostra o laço
 * de animação usado em jogos: a cada quadro, apagamos a tela, atualizamos a
 * posição da bola, desenhamos tudo de novo e esperamos um pouco.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Util --> u

  const inteiro LARGURA = 640
  const inteiro ALTURA = 480
  const inteiro DIAMETRO = 40

  // A posição (x, y) é o canto superior esquerdo do quadrado que contém a bola.
  // A velocidade diz quantos pixels a bola anda a cada quadro em cada direção:
  // um valor positivo leva para a direita (x) ou para baixo (y)
  inteiro x = 100
  inteiro y = 60
  inteiro velocidade_x = 4
  inteiro velocidade_y = 3

  // A bola muda de cor a cada quique
  inteiro cores[5]
  inteiro cor_atual = 0
  inteiro quiques = 0

  funcao inicio() {
    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(LARGURA, ALTURA)
    g.definir_titulo_janela("Bola Quicando")

    cores[0] = g.criar_cor(230, 57, 70)
    cores[1] = g.criar_cor(255, 183, 3)
    cores[2] = g.criar_cor(42, 157, 143)
    cores[3] = g.criar_cor(69, 123, 157)
    cores[4] = g.criar_cor(155, 93, 229)

    // Cada volta do laço é um quadro da animação. Com uma pausa de 16
    // milissegundos, são cerca de 60 quadros por segundo. 1800 quadros dão
    // mais ou menos 30 segundos de animação
    para (inteiro quadro = 0; quadro < 1800; quadro++) {
      apagar_tela()
      atualizar_posicao()
      desenhar()

      g.renderizar()
      u.aguarde(16)
    }

    g.encerrar_modo_grafico()
  }

  // 1. Apagar: pintamos a janela inteira com a cor do fundo, apagando o quadro
  // anterior. Sem isso, a bola deixaria uma marca por onde passou
  funcao apagar_tela() {
    g.definir_cor(g.criar_cor(20, 24, 40))
    g.limpar()
  }

  // 2. Atualizar: a bola anda de acordo com a velocidade. Se ela passar de uma
  // borda, colocamos a bola de volta junto à borda e invertemos o sinal da
  // velocidade naquela direção, fazendo ela voltar
  funcao atualizar_posicao() {
    x = x + velocidade_x
    y = y + velocidade_y

    // Borda esquerda (x = 0) e borda direita (x + diâmetro = largura da janela)
    se (x < 0) {
      x = 0
      velocidade_x = -velocidade_x
      quicou()
    } senao se (x + DIAMETRO > LARGURA) {
      x = LARGURA - DIAMETRO
      velocidade_x = -velocidade_x
      quicou()
    }

    // Borda de cima (y = 0) e borda de baixo. Lembre-se: o y cresce para baixo
    se (y < 0) {
      y = 0
      velocidade_y = -velocidade_y
      quicou()
    } senao se (y + DIAMETRO > ALTURA) {
      y = ALTURA - DIAMETRO
      velocidade_y = -velocidade_y
      quicou()
    }
  }

  // Conta o quique e passa para a próxima cor do vetor. O resto da divisão
  // (%) faz o índice voltar a 0 depois da última cor
  funcao quicou() {
    quiques++
    cor_atual = (cor_atual + 1) % 5
  }

  // 3. Desenhar: a bola na nova posição e o placar de quiques
  funcao desenhar() {
    g.definir_cor(cores[cor_atual])
    g.desenhar_elipse(x, y, DIAMETRO, DIAMETRO, verdadeiro)

    g.definir_cor(g.COR_BRANCO)
    g.definir_tamanho_texto(16.0)
    g.desenhar_texto(10, 10, "Quiques: " + quiques)
  }
}
