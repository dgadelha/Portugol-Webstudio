programa {
  funcao inicio() {
    inteiro numero, centenas, dezenas, unidades

    escreva("Digite um número de três dígitos: ")
    leia(numero)

    centenas = numero / 100
    dezenas = numero / 10 % 10
    unidades = numero % 10

    escreva(unidades * 100 + dezenas * 10 + centenas, "\n")
  }
}
