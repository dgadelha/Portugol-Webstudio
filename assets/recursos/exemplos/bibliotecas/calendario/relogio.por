/**
 * Este exemplo desenha um relógio analógico que acompanha a hora do computador.
 * Ele usa a biblioteca "Calendario" para obter a hora, o minuto e o segundo
 * atuais, e as funções seno e cosseno da biblioteca "Matematica" para calcular
 * para onde cada ponteiro aponta.
 */

programa {
  inclua biblioteca Calendario --> c
  inclua biblioteca Graficos --> g
  inclua biblioteca Matematica --> m
  inclua biblioteca Tipos --> tp
  inclua biblioteca Util --> u

  // Centro e raio do mostrador, em pixels
  const inteiro CENTRO_X = 200
  const inteiro CENTRO_Y = 200
  const inteiro RAIO = 170

  funcao inicio() {
    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(400, 450)
    g.definir_titulo_janela("Relógio Analógico")

    // O tamanho do texto só passa a valer na próxima renderização. Como vamos
    // medir os números para centralizá-los, renderizamos uma vez antes
    g.definir_tamanho_texto(22.0)
    g.renderizar()

    inteiro ultimo_segundo = -1

    // O relógio funciona até que a janela seja fechada. A cada volta, vemos se
    // o segundo mudou; só então desenhamos tudo de novo
    enquanto (verdadeiro) {
      inteiro hora = c.hora_atual(falso)
      inteiro minuto = c.minuto_atual()
      inteiro segundo = c.segundo_atual()

      se (segundo != ultimo_segundo) {
        ultimo_segundo = segundo
        desenhar_relogio(hora, minuto, segundo)
        g.renderizar()
      }

      // Conferimos a hora 5 vezes por segundo, assim o ponteiro dos segundos
      // anda sempre perto da virada de cada segundo
      u.aguarde(200)
    }
  }

  funcao desenhar_relogio(inteiro hora, inteiro minuto, inteiro segundo) {
    inteiro escuro = g.criar_cor(40, 44, 60)

    // Fundo da janela e mostrador
    g.definir_cor(g.criar_cor(225, 230, 240))
    g.limpar()

    g.definir_cor(escuro)
    g.desenhar_elipse(CENTRO_X - RAIO - 6, CENTRO_Y - RAIO - 6, 2 * RAIO + 12, 2 * RAIO + 12, verdadeiro)
    g.definir_cor(g.COR_BRANCO)
    g.desenhar_elipse(CENTRO_X - RAIO, CENTRO_Y - RAIO, 2 * RAIO, 2 * RAIO, verdadeiro)

    // Marcas dos minutos e números das horas. Uma volta completa tem 360 graus
    // e 60 minutos, então cada minuto corresponde a 6 graus
    g.definir_cor(escuro)

    para (inteiro i = 0; i < 60; i++) {
      real angulo = i * 6.0

      // As marcas das horas (a cada 5 minutos) são mais compridas
      se (i % 5 == 0) {
        desenhar_raio(angulo, RAIO * 0.84, RAIO * 0.95)

        // Cada hora corresponde a 30 graus. O número 12 fica no ângulo 0
        inteiro numero = i / 5

        se (numero == 0) {
          numero = 12
        }

        escrever_numero(angulo, RAIO * 0.70, "" + numero)
      } senao {
        desenhar_raio(angulo, RAIO * 0.90, RAIO * 0.95)
      }
    }

    // Ângulo de cada ponteiro, em graus, a partir do 12 e no sentido horário.
    // O ponteiro das horas anda 30 graus por hora, mais um pouco conforme os
    // minutos passam; o dos minutos anda 6 graus por minuto, e o dos segundos
    // também 6 graus por segundo
    real angulo_horas = (hora % 12) * 30.0 + minuto * 0.5
    real angulo_minutos = minuto * 6.0 + segundo * 0.1
    real angulo_segundos = segundo * 6.0

    g.definir_cor(escuro)
    desenhar_ponteiro(angulo_horas, RAIO * 0.50, 7.0)
    desenhar_ponteiro(angulo_minutos, RAIO * 0.78, 5.0)

    g.definir_cor(g.criar_cor(220, 40, 40))
    desenhar_raio(angulo_segundos + 180.0, 0.0, RAIO * 0.15)
    desenhar_raio(angulo_segundos, 0.0, RAIO * 0.85)
    g.desenhar_elipse(CENTRO_X - 6, CENTRO_Y - 6, 12, 12, verdadeiro)

    // A hora também em números, embaixo do relógio
    g.definir_cor(escuro)
    cadeia texto = dois_digitos(hora) + ":" + dois_digitos(minuto) + ":" + dois_digitos(segundo)
    g.desenhar_texto(CENTRO_X - g.largura_texto(texto) / 2, 400, texto)
  }

  // Converte um ângulo em graus para radianos, a unidade usada pelas funções
  // seno e cosseno: 180 graus equivalem a PI radianos
  funcao real radianos(real graus) {
    retorne graus * m.PI / 180.0
  }

  // Calcula o x de um ponto que está a uma certa distância do centro, na
  // direção do ângulo. O seno dá o deslocamento para a direita
  funcao inteiro ponto_x(real angulo, real distancia) {
    retorne CENTRO_X + tp.real_para_inteiro(distancia * m.seno(radianos(angulo)))
  }

  // Calcula o y do mesmo ponto. O cosseno dá o deslocamento para cima, e como
  // o y cresce para baixo, subtraímos em vez de somar
  funcao inteiro ponto_y(real angulo, real distancia) {
    retorne CENTRO_Y - tp.real_para_inteiro(distancia * m.cosseno(radianos(angulo)))
  }

  // Desenha um segmento na direção do ângulo, entre duas distâncias do centro
  funcao desenhar_raio(real angulo, real de, real ate) {
    g.desenhar_linha(ponto_x(angulo, de), ponto_y(angulo, de), ponto_x(angulo, ate), ponto_y(angulo, ate))
  }

  // Desenha um ponteiro grosso como um polígono de 4 pontos: a ponta, os dois
  // lados (perpendiculares ao ponteiro, a 90 graus) e a cauda
  funcao desenhar_ponteiro(real angulo, real comprimento, real largura) {
    inteiro pontos[4][2]

    pontos[0][0] = ponto_x(angulo, comprimento)
    pontos[0][1] = ponto_y(angulo, comprimento)
    pontos[1][0] = ponto_x(angulo + 90.0, largura)
    pontos[1][1] = ponto_y(angulo + 90.0, largura)
    pontos[2][0] = ponto_x(angulo + 180.0, comprimento * 0.15)
    pontos[2][1] = ponto_y(angulo + 180.0, comprimento * 0.15)
    pontos[3][0] = ponto_x(angulo - 90.0, largura)
    pontos[3][1] = ponto_y(angulo - 90.0, largura)

    g.desenhar_poligono(pontos, verdadeiro)
  }

  // Escreve o texto com o seu centro no ponto indicado pelo ângulo e pela
  // distância. Como o y do texto é o seu topo, subimos metade da altura
  funcao escrever_numero(real angulo, real distancia, cadeia texto) {
    inteiro x = ponto_x(angulo, distancia) - g.largura_texto(texto) / 2
    inteiro y = ponto_y(angulo, distancia) - g.altura_texto(texto) / 2

    g.desenhar_texto(x, y, texto)
  }

  funcao cadeia dois_digitos(inteiro numero) {
    se (numero < 10) {
      retorne "0" + numero
    }

    retorne "" + numero
  }
}
