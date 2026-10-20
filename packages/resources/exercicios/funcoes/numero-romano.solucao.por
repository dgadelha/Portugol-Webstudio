programa {
  funcao cadeia romano(inteiro numero) {
    inteiro valores[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1}
    cadeia simbolos[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"}
    cadeia resultado = ""

    para (inteiro i = 0; i < 13; i++) {
      enquanto (numero >= valores[i]) {
        resultado = resultado + simbolos[i]
        numero = numero - valores[i]
      }
    }

    retorne resultado
  }

  funcao inicio() {
    escreva(romano(2026))
  }
}
