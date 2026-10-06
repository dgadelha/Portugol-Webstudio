/**
 * Este exemplo lê um ano e diz se ele é bissexto, ou seja, se fevereiro tem 29 dias.
 * Ele mostra como juntar várias condições em uma só usando os operadores lógicos
 * "e", "ou" e "nao".
 */

programa {
  funcao inicio() {
    inteiro ano

    escreva("Digite um ano: ")
    leia(ano)

    // A regra do calendário é:
    //   - um ano é bissexto se for divisível por 4;
    //   - mas os anos que terminam em 00 (divisíveis por 100) não são bissextos...
    //   - ...a não ser que também sejam divisíveis por 400.
    //
    // O operador % devolve o resto da divisão. Se o resto for 0, a divisão é exata
    logico divisivel_por_4 = ano % 4 == 0
    logico divisivel_por_100 = ano % 100 == 0
    logico divisivel_por_400 = ano % 400 == 0

    // Guardar cada parte da regra em uma variável lógica deixa a condição
    // principal mais fácil de ler. Ela diz: "divisível por 4 e não divisível
    // por 100, ou então divisível por 400"
    se ((divisivel_por_4 e nao divisivel_por_100) ou divisivel_por_400) {
      escreva("\n", ano, " é um ano bissexto: fevereiro tem 29 dias.\n")
    } senao {
      escreva("\n", ano, " não é um ano bissexto: fevereiro tem 28 dias.\n")
    }

    // Explicamos qual parte da regra decidiu o resultado
    se (divisivel_por_400) {
      escreva("Motivo: é divisível por 400.\n")
    } senao se (divisivel_por_100) {
      escreva("Motivo: é divisível por 100, mas não por 400.\n")
    } senao se (divisivel_por_4) {
      escreva("Motivo: é divisível por 4 e não termina em 00.\n")
    } senao {
      escreva("Motivo: não é divisível por 4.\n")
    }
  }
}
