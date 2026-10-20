programa {
  funcao inicio() {
    inteiro n, matriz[10][10]

    leia(n)

    para (inteiro linha = 0; linha < n; linha++) {
      para (inteiro coluna = 0; coluna < n; coluna++) {
        se (linha == coluna) {
          matriz[linha][coluna] = 1
        } senao {
          matriz[linha][coluna] = 0
        }
      }
    }

    para (inteiro linha = 0; linha < n; linha++) {
      para (inteiro coluna = 0; coluna < n; coluna++) {
        escreva(matriz[linha][coluna], " ")
      }

      escreva("\n")
    }
  }
}
