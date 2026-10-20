programa {
  funcao inicio() {
    inteiro n, divisores = 0

    leia(n)

    para (inteiro i = 2; i < n; i++) {
      se (n % i == 0) {
        divisores++
      }
    }

    se (n >= 2 e divisores == 0) {
      escreva("primo\n")
    } senao {
      escreva("não é primo\n")
    }
  }
}
