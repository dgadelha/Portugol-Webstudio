programa {
  funcao inicio() {
    inteiro a, b, c, menor

    leia(a, b, c)

    menor = a

    se (b < menor) {
      menor = b
    }

    se (c < menor) {
      menor = c
    }

    escreva(menor, "\n")
  }
}
