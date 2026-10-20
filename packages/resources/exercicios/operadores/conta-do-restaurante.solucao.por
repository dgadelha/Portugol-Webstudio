programa {
  funcao inicio() {
    real conta, total
    inteiro pessoas

    escreva("Valor da conta: ")
    leia(conta)
    escreva("Número de pessoas: ")
    leia(pessoas)

    total = conta * 1.1

    escreva("Total: ", total, "\n")
    escreva("Por pessoa: ", total / pessoas, "\n")
  }
}
