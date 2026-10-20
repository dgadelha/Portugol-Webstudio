programa {
  funcao inicio() {
    inteiro numero, anterior = 0, atual = 0, maior = 0

    leia(numero)

    enquanto (numero != 0) {
      se (atual > 0 e numero > anterior) {
        atual++
      } senao {
        atual = 1
      }

      se (atual > maior) {
        maior = atual
      }

      anterior = numero
      leia(numero)
    }

    escreva(maior, "\n")
  }
}
