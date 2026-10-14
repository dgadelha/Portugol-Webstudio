programa {
  funcao real media(real notas[]) {
    real soma = 0.0
    para (inteiro i = 0; i < 4; i++) {
      soma = soma + notas[i]
    }
    retorne soma / 4
  }

  funcao inicio() {
    real notas[4] = {7.5, 8.0, 6.5, 9.0}
    real resultado = media(notas)
    escreva("A média é ", resultado, "\n")
  }
}
