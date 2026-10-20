programa {
  funcao inicio() {
    inteiro matriz[3][4], soma

    para (inteiro linha = 0; linha < 3; linha++) {
      para (inteiro coluna = 0; coluna < 4; coluna++) {
        leia(matriz[linha][coluna])
      }
    }

    para (inteiro linha = 0; linha < 3; linha++) {
      soma = 0

      para (inteiro coluna = 0; coluna < 4; coluna++) {
        soma = soma + matriz[linha][coluna]
      }

      escreva("linha ", linha, ": ", soma, "\n")
    }

    para (inteiro coluna = 0; coluna < 4; coluna++) {
      soma = 0

      para (inteiro linha = 0; linha < 3; linha++) {
        soma = soma + matriz[linha][coluna]
      }

      escreva("coluna ", coluna, ": ", soma, "\n")
    }
  }
}
