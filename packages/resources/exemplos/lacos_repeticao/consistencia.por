/**
 * Este exemplo pede ao usuário uma nota de 0 a 10 e repete a pergunta até que
 * um valor válido seja digitado. Ele mostra como usar o laço "faca-enquanto"
 * para validar (verificar a consistência de) os dados digitados.
 */

programa {
  funcao inicio() {
    real nota

    // O laço "faca-enquanto" executa as instruções pelo menos uma vez e só
    // depois verifica a condição. Isso é ideal para validar uma entrada:
    // primeiro perguntamos, depois conferimos se a resposta é válida
    faca {
      escreva("Digite uma nota de 0 a 10: ")
      leia(nota)

      // Avisamos o usuário do erro para que ele saiba por que a
      // pergunta está sendo repetida
      se (nota < 0 ou nota > 10) {
        escreva("A nota ", nota, " não é válida. Tente novamente.\n\n")
      }
    } enquanto (nota < 0 ou nota > 10)

    // A partir daqui, temos certeza de que a nota está entre 0 e 10
    escreva("\nNota registrada: ", nota, "\n")
  }
}
