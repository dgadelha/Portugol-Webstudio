programa {
  funcao inicio() {
    inteiro ano

    leia(ano)

    se ((ano % 4 == 0 e ano % 100 != 0) ou ano % 400 == 0) {
      escreva("bissexto\n")
    } senao {
      escreva("não é bissexto\n")
    }
  }
}
