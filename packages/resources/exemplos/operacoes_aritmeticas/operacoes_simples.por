/**
 * Este exemplo mostra os operadores aritméticos do Portugol (+, -, *, / e %)
 * e a ordem em que eles são calculados quando aparecem juntos em uma expressão.
 * Cada expressão é exibida ao lado do seu resultado.
 */

programa {
  funcao inicio() {
    real a = 7.0
    real b = 2.0

    // Os operadores básicos funcionam como na matemática.
    // Repare que a multiplicação usa * e a divisão usa /
    escreva("Operadores básicos, com a = 7 e b = 2:\n")
    escreva("  a + b = ", a + b, "\n")
    escreva("  a - b = ", a - b, "\n")
    escreva("  a * b = ", a * b, "\n")
    escreva("  a / b = ", a / b, "\n")

    // O operador % (módulo) calcula o resto de uma divisão entre inteiros:
    // 7 dividido por 2 dá 3 e sobra 1
    escreva("  7 % 2 = ", 7 % 2, "\n")

    // Quando há vários operadores na mesma expressão, a multiplicação (*),
    // a divisão (/) e o módulo (%) são calculados antes da soma (+) e da
    // subtração (-). Operadores de mesma prioridade são calculados da
    // esquerda para a direita
    escreva("\nPrioridade das operações:\n")

    // Primeiro 4 * 2 = 8, depois 5 + 8 = 13
    escreva("  5 + 4 * 2 = ", 5 + 4 * 2, "\n")

    // Primeiro 10 / 2 = 5, depois 20 - 5 = 15
    escreva("  20 - 10 / 2 = ", 20 - 10 / 2, "\n")

    // Mesma prioridade: da esquerda para a direita. 8 / 4 = 2, depois 2 * 2 = 4
    escreva("  8 / 4 * 2 = ", 8 / 4 * 2, "\n")

    // Os parênteses mudam a ordem: o que está dentro deles é calculado primeiro
    escreva("\nUsando parênteses:\n")

    // Primeiro 5 + 4 = 9, depois 9 * 2 = 18
    escreva("  (5 + 4) * 2 = ", (5 + 4) * 2, "\n")

    // Primeiro 20 - 10 = 10, depois 10 / 2 = 5
    escreva("  (20 - 10) / 2 = ", (20 - 10) / 2, "\n")

    // Um uso comum dos parênteses é calcular uma média: sem eles, apenas
    // a última nota seria dividida por 3
    real nota1 = 6.0
    real nota2 = 9.0
    real nota3 = 6.0

    escreva("\nMédia das notas 6, 9 e 6:\n")
    escreva("  Sem parênteses: 6 + 9 + 6 / 3 = ", nota1 + nota2 + nota3 / 3, "\n")
    escreva("  Com parênteses: (6 + 9 + 6) / 3 = ", (nota1 + nota2 + nota3) / 3, "\n")
  }
}
