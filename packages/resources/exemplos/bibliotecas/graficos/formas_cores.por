/**
 * Este exemplo mostra como desenhar as formas básicas da biblioteca "Graficos"
 * (retângulos, elipses, linhas, polígonos e textos) em várias cores, e como
 * funcionam as coordenadas da janela: a origem (0, 0) fica no canto superior
 * esquerdo, o x cresce para a direita e o y cresce para baixo.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Util --> u

  funcao inicio() {
    // Abre a janela e define o seu tamanho logo em seguida: 640 pixels de
    // largura (x vai de 0 a 639) e 480 de altura (y vai de 0 a 479)
    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(640, 480)
    g.definir_titulo_janela("Formas e Cores")

    // Além das constantes COR_*, podemos criar qualquer cor misturando
    // vermelho, verde e azul, cada um de 0 a 255
    inteiro creme = g.criar_cor(250, 246, 235)
    inteiro laranja = g.criar_cor(255, 140, 0)
    inteiro roxo = g.criar_cor(130, 60, 180)
    inteiro cinza = g.criar_cor(90, 90, 90)

    // "definir_cor" escolhe a cor dos próximos desenhos. "limpar" pinta a
    // janela inteira com ela, servindo de fundo
    g.definir_cor(creme)
    g.limpar()

    desenhar_eixos(cinza)

    // Retângulo: x e y do canto superior esquerdo, largura, altura, se os
    // cantos são arredondados e se ele é preenchido
    g.definir_cor(g.COR_AZUL)
    g.desenhar_retangulo(60, 80, 150, 90, falso, verdadeiro)

    // O mesmo tipo de retângulo, só com o contorno e com os cantos arredondados
    g.definir_cor(g.COR_VERMELHO)
    g.desenhar_retangulo(250, 80, 150, 90, verdadeiro, falso)

    // A elipse é desenhada dentro de um retângulo imaginário. Se a largura e a
    // altura forem iguais, ela vira um círculo
    g.definir_cor(g.COR_VERDE)
    g.desenhar_elipse(440, 80, 150, 90, verdadeiro)

    g.definir_cor(roxo)
    g.desenhar_elipse(90, 240, 100, 100, falso)

    // Linha: liga o ponto (x1, y1) ao ponto (x2, y2). Aqui desenhamos várias
    // linhas saindo do mesmo ponto, como um leque
    g.definir_cor(laranja)

    para (inteiro i = 0; i <= 6; i++) {
      g.desenhar_linha(325, 340, 250 + i * 25, 240)
    }

    // Polígono: uma matriz com uma linha para cada ponto (vértice). A coluna 0
    // guarda o x e a coluna 1 guarda o y. O último ponto é ligado ao primeiro
    inteiro triangulo[3][2] = {
      {515, 240},   // ponta de cima
      {590, 340},   // canto inferior direito
      {440, 340}    // canto inferior esquerdo
    }

    g.definir_cor(laranja)
    g.desenhar_poligono(triangulo, verdadeiro)

    // Textos: definimos o tamanho e a cor antes de escrever
    g.definir_cor(cinza)
    g.definir_tamanho_texto(14.0)
    g.desenhar_texto(60, 180, "retângulo preenchido")
    g.desenhar_texto(250, 180, "contorno arredondado")
    g.desenhar_texto(475, 180, "elipse")
    g.desenhar_texto(110, 350, "círculo")
    g.desenhar_texto(285, 350, "linhas")
    g.desenhar_texto(485, 350, "polígono")

    g.definir_cor(g.COR_PRETO)
    g.definir_tamanho_texto(22.0)
    g.definir_estilo_texto(falso, verdadeiro, falso)   // negrito
    g.desenhar_texto(200, 410, "Formas e cores no Portugol")

    // Nada aparece na janela até chamarmos "renderizar"
    g.renderizar()

    // Mantém o desenho na tela por 15 segundos e depois fecha a janela
    u.aguarde(15000)
    g.encerrar_modo_grafico()
  }

  // Desenha duas setas a partir do canto superior esquerdo, mostrando para
  // onde crescem as coordenadas x e y
  funcao desenhar_eixos(inteiro cor) {
    g.definir_cor(cor)
    g.definir_tamanho_texto(14.0)

    // Eixo x: para a direita
    g.desenhar_linha(10, 10, 60, 10)
    g.desenhar_linha(60, 10, 54, 6)
    g.desenhar_linha(60, 10, 54, 14)
    g.desenhar_texto(66, 4, "x")

    // Eixo y: para baixo
    g.desenhar_linha(10, 10, 10, 60)
    g.desenhar_linha(10, 60, 6, 54)
    g.desenhar_linha(10, 60, 14, 54)
    g.desenhar_texto(6, 64, "y")

    g.desenhar_texto(20, 18, "(0, 0)")
  }
}
