programa {
  funcao inicio() {
    inteiro n, potencia = 1

    leia(n)

    enquanto (potencia * 2 <= n) {
      potencia = potencia * 2
    }

    enquanto (potencia >= 1) {
      escreva(n / potencia)
      n = n % potencia
      potencia = potencia / 2
    }

    escreva("\n")
  }
}
