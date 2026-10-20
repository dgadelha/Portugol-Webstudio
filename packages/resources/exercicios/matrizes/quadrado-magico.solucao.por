programa {
  funcao inicio() {
    inteiro matriz[3][3], alvo, soma_linha, soma_coluna, diagonal = 0, secundaria = 0
    logico magico = verdadeiro

    para (inteiro linha = 0; linha < 3; linha++) {
      para (inteiro coluna = 0; coluna < 3; coluna++) {
        leia(matriz[linha][coluna])
      }
    }

    alvo = matriz[0][0] + matriz[0][1] + matriz[0][2]

    para (inteiro i = 0; i < 3; i++) {
      soma_linha = 0
      soma_coluna = 0

      para (inteiro j = 0; j < 3; j++) {
        soma_linha = soma_linha + matriz[i][j]
        soma_coluna = soma_coluna + matriz[j][i]
      }

      se (soma_linha != alvo ou soma_coluna != alvo) {
        magico = falso
      }

      diagonal = diagonal + matriz[i][i]
      secundaria = secundaria + matriz[i][2 - i]
    }

    se (diagonal != alvo ou secundaria != alvo) {
      magico = falso
    }

    se (magico) {
      escreva("mágico\n")
    } senao {
      escreva("não é mágico\n")
    }
  }
}
