programa {
  funcao inicio() {
    inteiro matriz[3][3], soma = 0

    para (inteiro linha = 0; linha < 3; linha++) {
      para (inteiro coluna = 0; coluna < 3; coluna++) {
        leia(matriz[linha][coluna])
      }
    }

    para (inteiro linha = 0; linha < 3; linha++) {
      para (inteiro coluna = 0; coluna < 3; coluna++) {
        soma = soma + matriz[linha][coluna]
      }
    }

    escreva(soma, "\n")
  }
}
