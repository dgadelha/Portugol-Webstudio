programa {
  funcao inicio() {
    real a, b
    caracter operador

    leia(a)
    leia(operador)
    leia(b)

    escolha (operador) {
      caso '+':
        escreva(a + b, "\n")
        pare
      caso '-':
        escreva(a - b, "\n")
        pare
      caso '*':
        escreva(a * b, "\n")
        pare
      caso '/':
        escreva(a / b, "\n")
        pare
      caso contrario:
        escreva("operador inválido\n")
    }
  }
}
