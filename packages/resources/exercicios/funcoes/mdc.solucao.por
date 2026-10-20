programa {
  funcao inteiro mdc(inteiro a, inteiro b) {
    inteiro resto

    enquanto (b != 0) {
      resto = a % b
      a = b
      b = resto
    }

    retorne a
  }

  funcao inicio() {
    escreva(mdc(12, 18))
  }
}
