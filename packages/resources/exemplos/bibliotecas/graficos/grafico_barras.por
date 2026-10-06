/**
 * Este exemplo desenha um gráfico de barras com a quantidade de chuva de cada
 * mês, guardada em um vetor. Ele mostra como usar uma regra de três para que a
 * maior barra ocupe toda a altura disponível e as outras fiquem proporcionais.
 */

programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Util --> u

  // Quantidade de chuva em cada mês, em milímetros (valores de exemplo)
  inteiro chuva[12] = {240, 210, 230, 120, 70, 40, 30, 25, 60, 130, 170, 220}
  cadeia meses[12] = {"jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"}

  // A área do gráfico: as barras crescem para cima a partir da linha da BASE
  // (lembre-se de que o y cresce para baixo) e podem subir até o TOPO
  const inteiro ESQUERDA = 60
  const inteiro BASE = 400
  const inteiro TOPO = 90
  const inteiro LARGURA_ESPACO = 50   // espaço de cada mês no eixo x
  const inteiro LARGURA_BARRA = 34

  funcao inicio() {
    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(720, 460)
    g.definir_titulo_janela("Gráfico de Barras")

    g.definir_cor(g.COR_BRANCO)
    g.limpar()

    // O tamanho do texto só passa a valer na próxima renderização. Como vamos
    // medir a largura dos textos para centralizá-los, renderizamos uma vez
    // logo depois de definir o tamanho
    g.definir_tamanho_texto(14.0)
    g.renderizar()

    // Primeiro descobrimos o maior valor do vetor: a barra dele terá a altura
    // máxima, e as outras serão calculadas em relação a ela
    inteiro maior = chuva[0]

    para (inteiro i = 1; i < 12; i++) {
      se (chuva[i] > maior) {
        maior = chuva[i]
      }
    }

    // Título e linha da base
    inteiro cinza = g.criar_cor(80, 80, 80)

    g.definir_cor(cinza)
    g.desenhar_texto(ESQUERDA, 30, "Chuva em cada mês (mm)")
    g.desenhar_linha(ESQUERDA - 10, BASE, ESQUERDA + 12 * LARGURA_ESPACO, BASE)

    inteiro altura_maxima = BASE - TOPO

    para (inteiro i = 0; i < 12; i++) {
      // Regra de três: se o maior valor corresponde a altura_maxima pixels,
      // o valor deste mês corresponde a valor * altura_maxima / maior pixels.
      // Multiplicamos antes de dividir para não perder precisão na divisão inteira
      inteiro altura_barra = chuva[i] * altura_maxima / maior

      // A barra começa em cima (y menor) e termina na base
      inteiro x = ESQUERDA + i * LARGURA_ESPACO + (LARGURA_ESPACO - LARGURA_BARRA) / 2
      inteiro y = BASE - altura_barra

      // Os meses mais chuvosos (acima de 150 mm) ficam em um azul mais escuro
      se (chuva[i] > 150) {
        g.definir_cor(g.criar_cor(30, 90, 180))
      } senao {
        g.definir_cor(g.criar_cor(120, 170, 230))
      }

      g.desenhar_retangulo(x, y, LARGURA_BARRA, altura_barra, falso, verdadeiro)

      // O valor fica logo acima da barra e o nome do mês logo abaixo da base,
      // ambos centralizados: começam na metade da barra menos metade do texto
      g.definir_cor(cinza)
      escrever_centralizado(x + LARGURA_BARRA / 2, y - 20, "" + chuva[i])
      escrever_centralizado(x + LARGURA_BARRA / 2, BASE + 8, meses[i])
    }

    g.renderizar()

    // Mantém o gráfico na tela por 15 segundos e depois fecha a janela
    u.aguarde(15000)
    g.encerrar_modo_grafico()
  }

  // Escreve o texto de forma que o seu meio fique na coordenada centro_x
  funcao escrever_centralizado(inteiro centro_x, inteiro y, cadeia texto) {
    g.desenhar_texto(centro_x - g.largura_texto(texto) / 2, y, texto)
  }
}
