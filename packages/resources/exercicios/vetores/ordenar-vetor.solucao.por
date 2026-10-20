programa {
  funcao inicio() {
    inteiro n, numeros[100], auxiliar

    leia(n)

    para (inteiro i = 0; i < n; i++) {
      leia(numeros[i])
    }

    para (inteiro i = 0; i < n - 1; i++) {
      para (inteiro j = 0; j < n - 1 - i; j++) {
        se (numeros[j] > numeros[j + 1]) {
          auxiliar = numeros[j]
          numeros[j] = numeros[j + 1]
          numeros[j + 1] = auxiliar
        }
      }
    }

    para (inteiro i = 0; i < n; i++) {
      escreva(numeros[i], "\n")
    }
  }
}
