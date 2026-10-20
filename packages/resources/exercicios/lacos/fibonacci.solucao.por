programa {
  funcao inicio() {
    inteiro n, atual = 0, proximo = 1, soma

    leia(n)

    para (inteiro i = 1; i <= n; i++) {
      escreva(atual, "\n")

      soma = atual + proximo
      atual = proximo
      proximo = soma
    }
  }
}
