programa {
  funcao inicio() {
    inteiro n, numeros[100], posicao = 0

    leia(n)

    para (inteiro i = 0; i < n; i++) {
      leia(numeros[i])
    }

    para (inteiro i = 1; i < n; i++) {
      se (numeros[i] > numeros[posicao]) {
        posicao = i
      }
    }

    escreva("maior: ", numeros[posicao], "\n")
    escreva("posição: ", posicao, "\n")
  }
}
