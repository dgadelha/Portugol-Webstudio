programa {
  funcao inicio() {
    inteiro numeros[8], procurado, vezes = 0

    para (inteiro i = 0; i < 8; i++) {
      leia(numeros[i])
    }

    leia(procurado)

    para (inteiro i = 0; i < 8; i++) {
      se (numeros[i] == procurado) {
        vezes++
      }
    }

    escreva(vezes, "\n")
  }
}
