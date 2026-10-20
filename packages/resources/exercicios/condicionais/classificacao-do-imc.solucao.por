programa {
  funcao inicio() {
    real peso, altura, imc

    leia(peso)
    leia(altura)

    imc = peso / (altura * altura)

    se (imc < 18.5) {
      escreva("abaixo do peso\n")
    } senao se (imc < 25) {
      escreva("peso normal\n")
    } senao se (imc < 30) {
      escreva("sobrepeso\n")
    } senao {
      escreva("obesidade\n")
    }
  }
}
