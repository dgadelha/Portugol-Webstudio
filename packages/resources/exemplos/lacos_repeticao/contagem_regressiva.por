/**
 * Este exemplo pede ao usuário um número e faz uma contagem regressiva a
 * partir dele até 1. Ele mostra como funciona o laço "enquanto": as instruções
 * se repetem enquanto a condição for verdadeira.
 */

programa {
  funcao inicio() {
    inteiro contador

    escreva("A contagem deve começar em qual número? ")
    leia(contador)

    escreva("\n")

    // O laço "enquanto" verifica a condição antes de cada repetição.
    // Se o usuário digitar 0 ou um número negativo, a condição já começa
    // falsa e o laço não é executado nenhuma vez
    enquanto (contador > 0) {
      escreva(contador, "...\n")

      // Diminuímos o contador a cada repetição. Sem esta linha, a condição
      // seria sempre verdadeira e o laço nunca terminaria
      contador = contador - 1
    }

    escreva("Já!\n")
  }
}
