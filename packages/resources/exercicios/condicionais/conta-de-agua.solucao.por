programa {
  funcao inicio() {
    inteiro consumo
    real valor = 25.0

    escreva("Consumo em m³: ")
    leia(consumo)

    se (consumo > 50) {
      valor = valor + 10 * 3 + 30 * 5 + (consumo - 50) * 8
    } senao se (consumo > 20) {
      valor = valor + 10 * 3 + (consumo - 20) * 5
    } senao se (consumo > 10) {
      valor = valor + (consumo - 10) * 3
    }

    escreva("Valor da conta: ", valor, "\n")
  }
}
