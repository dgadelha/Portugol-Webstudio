programa {
  funcao inicio() {
    inteiro matriz[3][3], maior

    para (inteiro linha = 0; linha < 3; linha++) {
      para (inteiro coluna = 0; coluna < 3; coluna++) {
        leia(matriz[linha][coluna])
      }
    }

    maior = matriz[0][0]

    para (inteiro linha = 0; linha < 3; linha++) {
      para (inteiro coluna = 0; coluna < 3; coluna++) {
        se (matriz[linha][coluna] > maior) {
          maior = matriz[linha][coluna]
        }
      }
    }

    escreva(maior, "\n")
  }
}
