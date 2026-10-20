programa {
  funcao inteiro potencia(inteiro base, inteiro expoente) {
    inteiro resultado = 1

    para (inteiro i = 1; i <= expoente; i++) {
      resultado = resultado * base
    }

    retorne resultado
  }

  funcao inicio() {
    escreva(potencia(2, 10))
  }
}
