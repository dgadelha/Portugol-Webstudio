/**
 * Este exemplo calcula o MDC (Máximo Divisor Comum) de dois números com o Algoritmo
 * de Euclides e, a partir dele, o MMC (Mínimo Múltiplo Comum). Ele mostra como
 * criar funções que recebem parâmetros e devolvem um valor com "retorne", e como
 * uma função pode usar outra.
 */

programa {
  // O Algoritmo de Euclides se baseia em uma ideia simples: o MDC de "a" e "b"
  // é igual ao MDC de "b" e do resto da divisão de "a" por "b". Repetimos essa
  // troca até o resto ser zero; nesse momento, o MDC é o valor que sobrou em "a"
  funcao inteiro mdc(inteiro a, inteiro b) {
    inteiro resto

    enquanto (b != 0) {
      resto = a % b
      a = b
      b = resto
    }

    retorne a
  }

  // O MMC pode ser calculado a partir do MDC: MMC(a, b) = a * b / MDC(a, b).
  // Dividimos antes de multiplicar para não gerar um número grande demais
  funcao inteiro mmc(inteiro a, inteiro b) {
    retorne a / mdc(a, b) * b
  }

  funcao inicio() {
    inteiro numero1, numero2

    escreva("Digite o primeiro número: ")
    leia(numero1)
    escreva("Digite o segundo número: ")
    leia(numero2)

    // Para manter o exemplo simples, trabalhamos apenas com números positivos
    se (numero1 <= 0 ou numero2 <= 0) {
      escreva("\nDigite apenas números maiores que zero.\n")
    } senao {
      escreva("\nMDC(", numero1, ", ", numero2, ") = ", mdc(numero1, numero2), "\n")
      escreva("MMC(", numero1, ", ", numero2, ") = ", mmc(numero1, numero2), "\n")

      // Quando o MDC é 1, os números não têm nenhum divisor em comum além do 1
      se (mdc(numero1, numero2) == 1) {
        escreva("\nEsses números são primos entre si: o único divisor comum é o 1.\n")
      }
    }
  }
}
