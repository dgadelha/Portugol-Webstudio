programa {
  funcao inicio() {
    inteiro n, numeros[100], quantidade = 0
    real media, soma = 0.0

    leia(n)

    para (inteiro i = 0; i < n; i++) {
      leia(numeros[i])
      soma = soma + numeros[i]
    }

    media = soma / n

    para (inteiro i = 0; i < n; i++) {
      se (numeros[i] > media) {
        escreva(numeros[i], "\n")
        quantidade++
      }
    }

    se (quantidade == 0) {
      escreva("nenhum\n")
    }
  }
}
