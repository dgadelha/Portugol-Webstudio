/**
 * Este exemplo calcula o IMC (Índice de Massa Corporal) a partir do peso e da altura.
 * Ele mostra como usar números reais e uma sequência de "se / senao se" para
 * encontrar a faixa em que um valor se encaixa.
 */

programa {
  inclua biblioteca Matematica --> mat

  funcao inicio() {
    real peso, altura, imc

    escreva("Digite seu peso em quilos (exemplo: 65.5): ")
    leia(peso)

    escreva("Digite sua altura em metros (exemplo: 1.70): ")
    leia(altura)

    // Sem esta verificação, uma altura 0 causaria uma divisão por zero
    se (peso <= 0 ou altura <= 0) {
      escreva("\nO peso e a altura precisam ser maiores que zero.\n")
    } senao {
      // O IMC é o peso dividido pela altura ao quadrado, arredondado para 1 casa
      // decimal. A faixa é escolhida com esse mesmo valor que aparece na tela
      imc = mat.arredondar(peso / (altura * altura), 1)

      escreva("\nSeu IMC é ", imc, "\n")

      // As faixas abaixo são as da Organização Mundial da Saúde (OMS). Como
      // cada "senao se" só é testado quando os anteriores deram falso, basta
      // comparar com o limite de cima de cada faixa
      se (imc < 18.5) {
        escreva("Faixa: abaixo do peso\n")
      } senao se (imc < 25.0) {
        escreva("Faixa: peso normal\n")
      } senao se (imc < 30.0) {
        escreva("Faixa: sobrepeso\n")
      } senao {
        escreva("Faixa: obesidade\n")
      }

      escreva("\nO IMC é apenas um índice e não leva em conta, por exemplo, a massa muscular.\n")
      escreva("Ele não substitui a avaliação de um profissional de saúde.\n")
    }
  }
}
