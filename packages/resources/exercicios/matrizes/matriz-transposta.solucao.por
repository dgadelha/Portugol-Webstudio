programa {
  funcao inicio() {
    inteiro matriz[2][3], transposta[3][2]

    para (inteiro linha = 0; linha < 2; linha++) {
      para (inteiro coluna = 0; coluna < 3; coluna++) {
        leia(matriz[linha][coluna])
        transposta[coluna][linha] = matriz[linha][coluna]
      }
    }

    para (inteiro linha = 0; linha < 3; linha++) {
      escreva(transposta[linha][0], " ", transposta[linha][1], "\n")
    }
  }
}
