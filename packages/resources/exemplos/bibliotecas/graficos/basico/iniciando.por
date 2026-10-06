/**
 * Este exemplo demonstra como utilizar as funções da biblioteca "Graficos" para
 * iniciar o ambiente gráfico do Portugol: abrir a janela, definir o seu tamanho e o
 * seu título, desenhar e exibir o resultado na tela.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Util --> u

  funcao inicio() {
    // Abre a janela do ambiente gráfico. O parâmetro verdadeiro faz com que a
    // janela fique sempre visível, à frente das outras janelas
    g.iniciar_modo_grafico(verdadeiro)

    // Define o tamanho da janela (largura e altura, em pixels) e o seu título
    g.definir_dimensoes_janela(400, 300)
    g.definir_titulo_janela("Iniciando o modo gráfico")

    // Pinta o fundo da janela: a função "limpar" preenche a janela com a cor atual
    g.definir_cor(g.COR_BRANCO)
    g.limpar()

    // Desenha um retângulo e um texto. As coordenadas são contadas a partir do
    // canto superior esquerdo da janela
    g.definir_cor(g.COR_AZUL)
    g.desenhar_retangulo(50, 50, 300, 200, verdadeiro, verdadeiro)

    g.definir_cor(g.COR_BRANCO)
    g.definir_tamanho_texto(20.0)
    g.desenhar_texto(110, 140, "Olá, Portugol!")

    // Os desenhos só aparecem na janela depois que a função "renderizar" é chamada
    g.renderizar()

    // Aguarda 5 segundos e encerra o modo gráfico, fechando a janela
    u.aguarde(5000)
    g.encerrar_modo_grafico()
  }
}
