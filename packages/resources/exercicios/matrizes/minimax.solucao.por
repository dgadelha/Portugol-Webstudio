programa {
  funcao inicio() {
    inteiro matriz[4][4], linha_do_maior = 0, coluna_do_maior = 0, coluna_do_menor = 0

    para (inteiro linha = 0; linha < 4; linha++) {
      para (inteiro coluna = 0; coluna < 4; coluna++) {
        leia(matriz[linha][coluna])

        se (matriz[linha][coluna] > matriz[linha_do_maior][coluna_do_maior]) {
          linha_do_maior = linha
          coluna_do_maior = coluna
        }
      }
    }

    para (inteiro coluna = 1; coluna < 4; coluna++) {
      se (matriz[linha_do_maior][coluna] < matriz[linha_do_maior][coluna_do_menor]) {
        coluna_do_menor = coluna
      }
    }

    escreva("valor: ", matriz[linha_do_maior][coluna_do_menor], "\n")
    escreva("linha: ", linha_do_maior, "\n")
    escreva("coluna: ", coluna_do_menor, "\n")
  }
}
