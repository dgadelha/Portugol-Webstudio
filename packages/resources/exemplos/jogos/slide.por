programa {
  inclua biblioteca Graficos --> g
  inclua biblioteca Util --> u
  inclua biblioteca Matematica --> mat
  inclua biblioteca Mouse --> m

  // Tamanho da janela, em pixels
  const inteiro TAMANHO_TELA = 600

  const inteiro TAMANHO_PRANCHA = 3

  inteiro prancha[TAMANHO_PRANCHA][TAMANHO_PRANCHA]
  inteiro tile = TAMANHO_TELA / TAMANHO_PRANCHA

  logico acabou = falso

  inteiro img = -1
  inteiro refresh = -1
  inteiro puzzle = -1

  inteiro btn_size = 32

  funcao inicializar() {
    carregar()
    embaralhar(prancha)
    g.iniciar_modo_grafico(verdadeiro)
    g.definir_dimensoes_janela(TAMANHO_TELA, TAMANHO_TELA)
  }

  funcao resolver(inteiro tabuleiro[][]) {
    inteiro ct = 0
    para (inteiro i = 0; i < TAMANHO_PRANCHA; i++) {
      para (inteiro j = 0; j < TAMANHO_PRANCHA; j++) {
        tabuleiro[i][j] = ct
        ct++
      }
    }
  }

  // Embaralha fazendo movimentos válidos a partir do tabuleiro resolvido. Trocar
  // peças ao acaso poderia gerar um tabuleiro impossível de resolver
  funcao embaralhar(inteiro tabuleiro[][]) {
    faca {
      resolver(tabuleiro)

      // No tabuleiro resolvido, o espaço vazio (a peça 0) fica no canto superior esquerdo
      inteiro linha_vazia = 0, coluna_vazia = 0

      para (inteiro passo = 0; passo < 200; passo++) {
        inteiro linha = linha_vazia, coluna = coluna_vazia

        escolha (u.sorteia(0, 3)) {
          caso 0:
            linha--
            pare
          caso 1:
            linha++
            pare
          caso 2:
            coluna--
            pare
          caso contrario:
            coluna++
        }

        // Move para o espaço vazio a peça vizinha sorteada, se ela existir
        se (linha >= 0 e linha < TAMANHO_PRANCHA e coluna >= 0 e coluna < TAMANHO_PRANCHA) {
          tabuleiro[linha_vazia][coluna_vazia] = tabuleiro[linha][coluna]
          tabuleiro[linha][coluna] = 0
          linha_vazia = linha
          coluna_vazia = coluna
        }
      }
    } enquanto (esta_ordenado(tabuleiro))
  }

  funcao carregar() {
    img = g.carregar_imagem("slide/img.jpg")
    inteiro temp = g.carregar_imagem("slide/refresh.png")
    refresh = g.redimensionar_imagem(temp, btn_size - 16, btn_size - 16, verdadeiro)
    g.liberar_imagem(temp)
    temp = g.carregar_imagem("slide/puz.png")
    puzzle = g.redimensionar_imagem(temp, btn_size - 16, btn_size - 16, verdadeiro)
    g.liberar_imagem(temp)
  }

  funcao desenhar_pronto() {
    g.desenhar_imagem(0, 0, img)
    desenhar_botoes()
  }

  funcao desenhar_jogando() {
    g.definir_cor(0x333333)
    g.limpar()
    para (inteiro i = 0; i < TAMANHO_PRANCHA; i++) {
      para (inteiro j = 0; j < TAMANHO_PRANCHA; j++) {
        se (prancha[i][j] != 0) {
          g.desenhar_porcao_imagem(j * tile, i * tile, (prancha[i][j] % TAMANHO_PRANCHA) * tile, mat.arredondar(prancha[i][j] / TAMANHO_PRANCHA, 0) * tile, tile, tile, img)

          g.definir_opacidade(127)
          g.definir_cor(0xeeeeee)
          g.desenhar_linha(j * tile, i * tile, j * tile + tile - 1, i * tile)
          g.desenhar_linha(j * tile, i * tile, j * tile, i * tile + tile - 1)
          g.definir_opacidade(255)
          g.definir_cor(0x333333)
          g.desenhar_linha(j * tile + tile - 1, i * tile, j * tile + tile - 1, i * tile + tile - 1)
          g.desenhar_linha(j * tile, i * tile + tile - 1, j * tile + tile - 1, i * tile + tile - 1)
        }
      }
    }

    desenhar_botoes()
  }

  // Desenha os botões de embaralhar (à direita) e de resolver (à esquerda dele)
  funcao desenhar_botoes() {
    g.definir_cor(0xcdcdcd)
    se (mouse_sobre_embaralhar(m.posicao_x(), m.posicao_y())) {
      g.definir_cor(0xffffff)
    }
    g.desenhar_retangulo(TAMANHO_TELA - btn_size - 8, TAMANHO_TELA - btn_size - 8, btn_size, btn_size, verdadeiro, verdadeiro)
    g.definir_cor(0xbcbcbc)
    g.desenhar_retangulo(TAMANHO_TELA - btn_size - 8, TAMANHO_TELA - btn_size - 8, btn_size, btn_size, verdadeiro, falso)
    g.desenhar_imagem(TAMANHO_TELA - btn_size, TAMANHO_TELA - btn_size, refresh)

    g.definir_cor(0xcdcdcd)
    se (mouse_sobre_resolver(m.posicao_x(), m.posicao_y())) {
      g.definir_cor(0xffffff)
    }
    g.desenhar_retangulo(TAMANHO_TELA - 2 * btn_size - 16, TAMANHO_TELA - btn_size - 8, btn_size, btn_size, verdadeiro, verdadeiro)
    g.definir_cor(0xbcbcbc)
    g.desenhar_retangulo(TAMANHO_TELA - 2 * btn_size - 16, TAMANHO_TELA - btn_size - 8, btn_size, btn_size, verdadeiro, falso)
    g.desenhar_imagem(TAMANHO_TELA - 2 * btn_size - 8, TAMANHO_TELA - btn_size, puzzle)
  }

  funcao logico mouse_sobre_embaralhar(inteiro x, inteiro y) {
    retorne x > TAMANHO_TELA - btn_size - 16 e y > TAMANHO_TELA - btn_size - 16
  }

  funcao logico mouse_sobre_resolver(inteiro x, inteiro y) {
    retorne x > TAMANHO_TELA - 2 * btn_size - 32 e x < TAMANHO_TELA - btn_size - 16 e y > TAMANHO_TELA - btn_size - 16
  }

  funcao logico esta_ordenado(inteiro tabuleiro[][]) {
    inteiro ct = 0
    para (inteiro i = 0; i < TAMANHO_PRANCHA; i++) {
      para (inteiro j = 0; j < TAMANHO_PRANCHA; j++) {
        se (tabuleiro[i][j] != ct) {
          retorne falso
        }
        ct++
      }
    }
    retorne verdadeiro
  }

  // Move a peça da posição (i, j) para o espaço vazio, se ele estiver ao lado dela
  funcao mover_peca(inteiro i, inteiro j) {
    se (i < 0 ou i >= TAMANHO_PRANCHA ou j < 0 ou j >= TAMANHO_PRANCHA) {
      retorne
    }

    inteiro aux

    se (i > 0) {
      se (prancha[i - 1][j] == 0) {
        aux = prancha[i - 1][j]
        prancha[i - 1][j] = prancha[i][j]
        prancha[i][j] = aux
        retorne
      }
    }
    se (i < TAMANHO_PRANCHA - 1) {
      se (prancha[i + 1][j] == 0) {
        aux = prancha[i + 1][j]
        prancha[i + 1][j] = prancha[i][j]
        prancha[i][j] = aux
        retorne
      }
    }
    se (j > 0) {
      se (prancha[i][j - 1] == 0) {
        aux = prancha[i][j - 1]
        prancha[i][j - 1] = prancha[i][j]
        prancha[i][j] = aux
        retorne
      }
    }
    se (j < TAMANHO_PRANCHA - 1) {
      se (prancha[i][j + 1] == 0) {
        aux = prancha[i][j + 1]
        prancha[i][j + 1] = prancha[i][j]
        prancha[i][j] = aux
      }
    }
  }

  funcao controlar() {
    se (nao m.botao_pressionado(m.BOTAO_ESQUERDO)) {
      retorne
    }

    inteiro x = m.posicao_x()
    inteiro y = m.posicao_y()

    // Cada clique faz uma única ação: os botões ficam sobre as peças, então um
    // clique em um botão não pode mover a peça que está embaixo dele
    se (mouse_sobre_embaralhar(x, y)) {
      embaralhar(prancha)
      acabou = falso
    } senao se (mouse_sobre_resolver(x, y)) {
      resolver(prancha)
      acabou = verdadeiro
    } senao se (nao acabou) {
      mover_peca(y / tile, x / tile)

      se (esta_ordenado(prancha)) {
        acabou = verdadeiro
      }
    }

    // Aguarda o botão ser solto, para que segurá-lo não repita a ação
    enquanto (m.botao_pressionado(m.BOTAO_ESQUERDO)) {
      u.aguarde(10)
    }
  }

  funcao inicio() {
    inicializar()
    enquanto (verdadeiro) {
      controlar()
      se (nao acabou) {
        desenhar_jogando()
      } senao {
        desenhar_pronto()
      }
      g.renderizar()
    }
  }
}
