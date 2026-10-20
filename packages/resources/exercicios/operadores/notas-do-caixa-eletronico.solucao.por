programa {
  funcao inicio() {
    inteiro valor

    escreva("Valor do saque: ")
    leia(valor)

    escreva("Notas de 100: ", valor / 100, "\n")
    valor = valor % 100
    escreva("Notas de 50: ", valor / 50, "\n")
    valor = valor % 50
    escreva("Notas de 20: ", valor / 20, "\n")
    valor = valor % 20
    escreva("Notas de 10: ", valor / 10, "\n")
    valor = valor % 10
    escreva("Notas de 5: ", valor / 5, "\n")
    valor = valor % 5
    escreva("Notas de 2: ", valor / 2, "\n")
    escreva("Moedas de 1: ", valor % 2, "\n")
  }
}
