/**
 * Este exemplo é o Jogo da Velha para duas pessoas. O tabuleiro é uma matriz 3x3 de
 * caracteres, e cada jogador digita a linha e a coluna da sua jogada. Ele mostra
 * como percorrer linhas, colunas e diagonais de uma matriz e como dividir um
 * programa maior em funções, cada uma com uma tarefa.
 */

programa {
  // O tabuleiro é declarado fora das funções para que todas possam usá-lo.
  // Cada casa guarda 'X', 'O' ou ' ' (espaço, para casa vazia)
  caracter tabuleiro[3][3]

  // Deixa todas as casas vazias
  funcao preparar_tabuleiro() {
    para (inteiro linha = 0; linha < 3; linha++) {
      para (inteiro coluna = 0; coluna < 3; coluna++) {
        tabuleiro[linha][coluna] = ' '
      }
    }
  }

  // Desenha o tabuleiro com os números das linhas e das colunas
  funcao desenhar_tabuleiro() {
    escreva("     1   2   3\n")

    para (inteiro linha = 0; linha < 3; linha++) {
      escreva("  ", linha + 1, "  ")

      para (inteiro coluna = 0; coluna < 3; coluna++) {
        escreva(tabuleiro[linha][coluna])

        // Separa as colunas, mas não depois da última
        se (coluna < 2) {
          escreva(" | ")
        }
      }

      escreva("\n")

      // Separa as linhas, mas não depois da última
      se (linha < 2) {
        escreva("    ---+---+---\n")
      }
    }
  }

  // Devolve verdadeiro se o jogador completou uma linha, uma coluna ou uma diagonal
  funcao logico verificar_vencedor(caracter jogador) {
    // As linhas e as colunas são verificadas no mesmo laço: na volta "i",
    // olhamos a linha i e a coluna i
    para (inteiro i = 0; i < 3; i++) {
      se (tabuleiro[i][0] == jogador e tabuleiro[i][1] == jogador e tabuleiro[i][2] == jogador) {
        retorne verdadeiro
      }

      se (tabuleiro[0][i] == jogador e tabuleiro[1][i] == jogador e tabuleiro[2][i] == jogador) {
        retorne verdadeiro
      }
    }

    // Diagonal principal: casas em que a linha é igual à coluna
    se (tabuleiro[0][0] == jogador e tabuleiro[1][1] == jogador e tabuleiro[2][2] == jogador) {
      retorne verdadeiro
    }

    // Diagonal secundária: do canto de cima à direita até o de baixo à esquerda
    se (tabuleiro[0][2] == jogador e tabuleiro[1][1] == jogador e tabuleiro[2][0] == jogador) {
      retorne verdadeiro
    }

    retorne falso
  }

  funcao inicio() {
    caracter jogador = 'X'
    inteiro linha, coluna
    inteiro jogadas = 0
    logico venceu = falso
    cadeia aviso = ""

    preparar_tabuleiro()

    // O jogo continua até alguém vencer ou as 9 casas serem preenchidas
    enquanto (nao venceu e jogadas < 9) {
      // O "limpa" apaga a tela, para o tabuleiro ser sempre desenhado no mesmo lugar
      limpa()
      escreva("Jogo da Velha\n\n")
      desenhar_tabuleiro()

      // O aviso de jogada inválida é guardado e mostrado depois de limpar a
      // tela; se fosse escrito antes, o "limpa" o apagaria
      se (aviso != "") {
        escreva("\n", aviso, "\n")
        aviso = ""
      }

      escreva("\nVez do jogador ", jogador, "\n")
      escreva("Linha (1 a 3): ")
      leia(linha)
      escreva("Coluna (1 a 3): ")
      leia(coluna)

      // Para quem joga, as posições vão de 1 a 3, mas na matriz vão de 0 a 2.
      // Por isso usamos "linha - 1" e "coluna - 1" para acessar a casa
      se (linha < 1 ou linha > 3 ou coluna < 1 ou coluna > 3) {
        aviso = "Posição inválida! A linha e a coluna devem ser de 1 a 3."
      } senao se (tabuleiro[linha - 1][coluna - 1] != ' ') {
        aviso = "Essa casa já está ocupada! Escolha outra."
      } senao {
        tabuleiro[linha - 1][coluna - 1] = jogador
        jogadas++

        venceu = verificar_vencedor(jogador)

        // Se ninguém venceu, passa a vez para o outro jogador
        se (nao venceu) {
          se (jogador == 'X') {
            jogador = 'O'
          } senao {
            jogador = 'X'
          }
        }
      }
    }

    // Mostra o tabuleiro final e o resultado
    limpa()
    escreva("Jogo da Velha\n\n")
    desenhar_tabuleiro()

    se (venceu) {
      escreva("\nO jogador ", jogador, " venceu! Parabéns!\n")
    } senao {
      escreva("\nDeu velha! Ninguém venceu.\n")
    }
  }
}
