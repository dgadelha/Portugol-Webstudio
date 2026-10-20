programa {
  funcao inicio() {
    inteiro n, numeros[100], diferentes[100], quantidade = 0
    logico repetido

    leia(n)

    para (inteiro i = 0; i < n; i++) {
      leia(numeros[i])
    }

    para (inteiro i = 0; i < n; i++) {
      repetido = falso

      para (inteiro j = 0; j < quantidade; j++) {
        se (diferentes[j] == numeros[i]) {
          repetido = verdadeiro
        }
      }

      se (nao repetido) {
        diferentes[quantidade] = numeros[i]
        quantidade++
        escreva(numeros[i], "\n")
      }
    }
  }
}
