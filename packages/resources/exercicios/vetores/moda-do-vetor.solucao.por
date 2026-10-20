programa {
  funcao inicio() {
    inteiro n, numeros[100], moda, vezes_da_moda = 0, vezes

    leia(n)

    para (inteiro i = 0; i < n; i++) {
      leia(numeros[i])
    }

    moda = numeros[0]

    para (inteiro i = 0; i < n; i++) {
      vezes = 0

      para (inteiro j = 0; j < n; j++) {
        se (numeros[j] == numeros[i]) {
          vezes++
        }
      }

      se (vezes > vezes_da_moda ou (vezes == vezes_da_moda e numeros[i] < moda)) {
        moda = numeros[i]
        vezes_da_moda = vezes
      }
    }

    escreva(moda, "\n")
  }
}
