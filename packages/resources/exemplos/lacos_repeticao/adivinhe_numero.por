/**
 * Este exemplo é o jogo "Adivinhe o Número": o computador sorteia um número de 1 a 100
 * e você tenta acertar, recebendo dicas de "maior" ou "menor". Ele mostra como usar
 * o laço "faca-enquanto" para repetir até uma condição ser atendida e como contar
 * as tentativas.
 */

programa {
  inclua biblioteca Util --> u

  funcao inicio() {
    inteiro numero_secreto = u.sorteia(1, 100)
    inteiro palpite
    inteiro tentativas = 0

    escreva("Pensei em um número de 1 a 100. Tente adivinhar!\n")

    // O "faca-enquanto" executa o bloco pelo menos uma vez e só depois testa
    // a condição. Aqui isso é perfeito: sempre precisamos de pelo menos um palpite
    faca {
      escreva("\nSeu palpite: ")
      leia(palpite)

      // Cada volta do laço é uma tentativa
      tentativas++

      se (palpite < numero_secreto) {
        escreva("O número secreto é maior que ", palpite, ".\n")
      } senao se (palpite > numero_secreto) {
        escreva("O número secreto é menor que ", palpite, ".\n")
      }
    } enquanto (palpite != numero_secreto)

    // Quando o laço termina, sabemos que o palpite está certo
    escreva("\nVocê acertou! O número era ", numero_secreto, ".\n")

    se (tentativas == 1) {
      escreva("Incrível, você acertou de primeira!\n")
    } senao {
      escreva("Você precisou de ", tentativas, " tentativas.\n")
    }
  }
}
