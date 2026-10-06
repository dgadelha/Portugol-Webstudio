/**
 * Este exemplo divide uma quantidade de balas igualmente entre um grupo de
 * crianças. Ele mostra a diferença entre a divisão inteira (/), que diz quantas
 * balas cada criança recebe, e o resto da divisão (%), que diz quantas sobram.
 */

programa {
  funcao inicio() {
    inteiro balas, criancas, balas_por_crianca, balas_que_sobram

    escreva("Quantas balas há no pacote? ")
    leia(balas)

    escreva("Entre quantas crianças elas serão divididas? ")
    leia(criancas)

    // Não é possível dividir por zero, então verificamos antes de calcular
    se (criancas <= 0) {
      escreva("\nÉ preciso ter pelo menos uma criança para dividir as balas.\n")
    } senao {
      // Quando os dois valores são do tipo inteiro, o operador / faz a divisão
      // inteira: o resultado não tem casas decimais. Por exemplo, 17 / 5 = 3
      balas_por_crianca = balas / criancas

      // O operador % calcula o resto da divisão inteira. Por exemplo, 17 % 5 = 2,
      // pois 5 cabe 3 vezes em 17 (15) e sobram 2
      balas_que_sobram = balas % criancas

      escreva("\nBalas para cada criança: ", balas_por_crianca, "\n")
      escreva("Balas que sobram no pacote: ", balas_que_sobram, "\n")

      // Podemos conferir a conta: o quociente vezes o divisor, mais o resto,
      // é sempre igual ao valor que foi dividido
      escreva("\nConferindo: ", balas_por_crianca, " x ", criancas, " + ", balas_que_sobram, " = ", balas_por_crianca * criancas + balas_que_sobram, "\n")
    }
  }
}
