/**
 * Este exemplo desenha a Bandeira do Brasil com as proporções oficiais, de forma
 * simplificada (sem as estrelas e o lema "Ordem e Progresso"). Ele
 * mostra como calcular coordenadas a partir de uma medida base (o "módulo") e
 * como desenhar um losango com "desenhar_poligono", usando uma matriz de pontos.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Matematica --> m
  inclua biblioteca Tipos --> tp
  inclua biblioteca Util --> u

  // A lei que define a bandeira usa uma medida chamada módulo: a bandeira tem
  // 20 módulos de largura e 14 de altura. Escolhendo 30 pixels por módulo, ela
  // fica com 600 x 420 pixels. Mude este valor para desenhar uma bandeira maior
  // ou menor: todas as outras medidas são calculadas a partir dele
  const inteiro MODULO = 30

  // Distância entre a borda da janela e a bandeira
  const inteiro MARGEM = 40

  funcao inicio() {
    inteiro largura = 20 * MODULO
    inteiro altura = 14 * MODULO

    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(largura + 2 * MARGEM, altura + 2 * MARGEM)
    g.definir_titulo_janela("Bandeira do Brasil")

    g.definir_cor(g.criar_cor(235, 235, 235))
    g.limpar()

    // O centro da bandeira: todas as figuras são desenhadas em volta dele
    inteiro centro_x = MARGEM + largura / 2
    inteiro centro_y = MARGEM + altura / 2

    // 1. O retângulo verde ocupa a bandeira inteira
    g.definir_cor(g.criar_cor(0, 156, 59))
    g.desenhar_retangulo(MARGEM, MARGEM, largura, altura, falso, verdadeiro)

    // 2. O losango amarelo. Cada vértice fica a 1,7 módulo da borda da bandeira.
    // Na matriz, cada linha é um ponto: a coluna 0 é o x e a coluna 1 é o y.
    // Lembre-se de que o y cresce para baixo: o vértice de cima tem o menor y
    inteiro distancia = 17 * MODULO / 10   // 1,7 módulo, sem usar números reais

    inteiro losango[4][2] = {
      {MARGEM + distancia, centro_y},             // vértice da esquerda
      {centro_x, MARGEM + distancia},             // vértice de cima
      {MARGEM + largura - distancia, centro_y},   // vértice da direita
      {centro_x, MARGEM + altura - distancia}     // vértice de baixo
    }

    g.definir_cor(g.criar_cor(255, 223, 0))
    g.desenhar_poligono(losango, verdadeiro)

    // 3. O círculo azul tem raio de 3,5 módulos e fica no centro. A elipse é
    // desenhada a partir do canto superior esquerdo do quadrado que a contém,
    // por isso subtraímos o raio do centro
    inteiro raio = 35 * MODULO / 10

    g.definir_cor(g.criar_cor(0, 39, 118))
    g.desenhar_elipse(centro_x - raio, centro_y - raio, 2 * raio, 2 * raio, verdadeiro)

    // 4. A faixa branca
    desenhar_faixa(centro_x, centro_y, raio)

    g.renderizar()

    // Mantém o desenho na tela por 15 segundos e depois fecha a janela
    u.aguarde(15000)
    g.encerrar_modo_grafico()
  }

  // A faixa branca fica entre dois arcos de circunferência, de raios 8 e 8,5
  // módulos, cujo centro está 2 módulos à esquerda do meio da borda de baixo
  // da bandeira. Como não existe uma função para desenhar arcos, pintamos a
  // faixa coluna por coluna: para cada x dentro do círculo azul, calculamos
  // onde ficam os dois arcos e desenhamos uma linha vertical entre eles
  funcao desenhar_faixa(inteiro centro_x, inteiro centro_y, inteiro raio) {
    real arco_x = centro_x - 2.0 * MODULO
    real arco_y = centro_y + 7.0 * MODULO
    real raio_interno = 8.0 * MODULO
    real raio_externo = 8.5 * MODULO

    g.definir_cor(g.COR_BRANCO)

    para (inteiro x = centro_x - raio; x <= centro_x + raio; x++) {
      // Pelo teorema de Pitágoras, um ponto de uma circunferência que está a
      // uma distância horizontal dx do centro fica raiz(raio² - dx²) acima dele
      real dx = x - arco_x
      real topo_faixa = arco_y - m.raiz(raio_externo * raio_externo - dx * dx, 2.0)
      real base_faixa = arco_y - m.raiz(raio_interno * raio_interno - dx * dx, 2.0)

      // A mesma conta dá o topo e a base do círculo azul nesta coluna. A faixa
      // não pode passar para fora dele
      inteiro dc = x - centro_x
      real meia_altura = m.raiz(tp.inteiro_para_real(raio * raio - dc * dc), 2.0)
      real topo_circulo = centro_y - meia_altura
      real base_circulo = centro_y + meia_altura

      se (topo_faixa < topo_circulo) {
        topo_faixa = topo_circulo
      }

      se (base_faixa > base_circulo) {
        base_faixa = base_circulo
      }

      se (topo_faixa < base_faixa) {
        // As funções de desenho recebem coordenadas inteiras, então convertemos
        g.desenhar_linha(x, tp.real_para_inteiro(topo_faixa), x, tp.real_para_inteiro(base_faixa))
      }
    }
  }
}
