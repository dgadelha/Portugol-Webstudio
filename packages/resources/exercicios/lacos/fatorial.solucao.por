programa {
  funcao inicio() {
    inteiro n, fatorial = 1

    leia(n)

    para (inteiro i = 2; i <= n; i++) {
      fatorial = fatorial * i
    }

    escreva(fatorial, "\n")
  }
}
