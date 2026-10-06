/**
 * Este exemplo é o jogo Pedra, Papel e Tesoura contra o computador, em 3 rodadas.
 * Ele mostra como sortear números com a biblioteca Util, usar o "escolha" para
 * transformar um número em um nome e combinar condições para decidir quem venceu.
 */

programa {
  inclua biblioteca Util --> u

  // Converte o número de uma jogada no seu nome
  funcao cadeia nome_jogada(inteiro jogada) {
    escolha (jogada) {
      caso 1:
        retorne "Pedra"
      caso 2:
        retorne "Papel"
      caso contrario:
        retorne "Tesoura"
    }
  }

  funcao inicio() {
    inteiro jogador, computador
    inteiro pontos_jogador = 0, pontos_computador = 0

    escreva("Pedra, Papel e Tesoura - 3 rodadas\n")

    para (inteiro rodada = 1; rodada <= 3; rodada++) {
      escreva("\nRodada ", rodada, "\n")
      escreva("1) Pedra\n")
      escreva("2) Papel\n")
      escreva("3) Tesoura\n")

      // Repetimos a pergunta até o jogador digitar uma opção válida
      faca {
        escreva("Sua jogada: ")
        leia(jogador)

        se (jogador < 1 ou jogador > 3) {
          escreva("Opção inválida, digite 1, 2 ou 3.\n")
        }
      } enquanto (jogador < 1 ou jogador > 3)

      // O computador sorteia um número de 1 a 3
      computador = u.sorteia(1, 3)

      escreva("Você jogou ", nome_jogada(jogador), " e o computador jogou ", nome_jogada(computador), ".\n")

      // Pedra ganha da tesoura, tesoura ganha do papel e papel ganha da pedra
      se (jogador == computador) {
        escreva("Empate!\n")
      } senao se ((jogador == 1 e computador == 3) ou (jogador == 3 e computador == 2) ou (jogador == 2 e computador == 1)) {
        escreva("Você venceu a rodada!\n")
        pontos_jogador++
      } senao {
        escreva("O computador venceu a rodada!\n")
        pontos_computador++
      }
    }

    escreva("\nPlacar final: você ", pontos_jogador, " x ", pontos_computador, " computador\n")

    se (pontos_jogador > pontos_computador) {
      escreva("Parabéns, você venceu o jogo!\n")
    } senao se (pontos_computador > pontos_jogador) {
      escreva("O computador venceu desta vez. Que tal jogar de novo?\n")
    } senao {
      escreva("O jogo terminou empatado!\n")
    }
  }
}
