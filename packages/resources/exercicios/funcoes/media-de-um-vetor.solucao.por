programa {
  funcao real media(real valores[], inteiro tamanho) {
    real soma = 0.0

    para (inteiro i = 0; i < tamanho; i++) {
      soma = soma + valores[i]
    }

    retorne soma / tamanho
  }

  funcao inicio() {
    real notas[] = {7.0, 8.5, 6.0}

    escreva(media(notas, 3))
  }
}
