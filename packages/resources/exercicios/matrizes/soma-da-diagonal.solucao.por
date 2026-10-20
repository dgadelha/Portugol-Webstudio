programa {
  funcao inicio() {
    inteiro n, matriz[10][10], soma = 0

    leia(n)

    para (inteiro linha = 0; linha < n; linha++) {
      para (inteiro coluna = 0; coluna < n; coluna++) {
        leia(matriz[linha][coluna])
      }
    }

    para (inteiro i = 0; i < n; i++) {
      soma = soma + matriz[i][i]
    }

    escreva(soma, "\n")
  }
}
