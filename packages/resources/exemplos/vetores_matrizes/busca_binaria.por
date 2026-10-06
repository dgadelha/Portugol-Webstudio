/**
 * Este exemplo procura um número em um vetor ordenado usando a busca binária.
 * Em vez de olhar um elemento de cada vez, ela compara com o elemento do meio e
 * descarta a metade onde o número não pode estar. Cada passo é mostrado, junto
 * com o total de comparações feitas.
 */

programa {
  funcao inicio() {
    const inteiro TAMANHO = 15
    // A busca binária só funciona se o vetor estiver em ordem crescente
    inteiro numeros[TAMANHO] = {2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 80, 88, 91, 99}
    inteiro procurado
    inteiro comeco = 0, fim = TAMANHO - 1, meio
    inteiro comparacoes = 0
    inteiro posicao = -1

    escreva("Vetor: ")

    para (inteiro i = 0; i < TAMANHO; i++) {
      escreva(numeros[i], " ")
    }

    escreva("\n\nQual número você quer procurar? ")
    leia(procurado)
    escreva("\n")

    // "comeco" e "fim" marcam o trecho do vetor onde o número ainda pode estar.
    // Enquanto esse trecho não estiver vazio, continuamos procurando
    enquanto (comeco <= fim e posicao == -1) {
      // A divisão entre inteiros descarta a parte decimal
      meio = (comeco + fim) / 2
      comparacoes++

      escreva("Passo ", comparacoes, ": início = ", comeco, ", meio = ", meio, ", fim = ", fim)
      escreva(" -> comparando com ", numeros[meio], "\n")

      se (numeros[meio] == procurado) {
        // Encontramos! Guardar a posição também faz o laço terminar
        posicao = meio
      } senao se (numeros[meio] < procurado) {
        // O número procurado é maior, então só pode estar à direita do meio
        comeco = meio + 1
      } senao {
        // O número procurado é menor, então só pode estar à esquerda do meio
        fim = meio - 1
      }
    }

    se (posicao != -1) {
      escreva("\nO número ", procurado, " está na posição ", posicao, " do vetor.\n")
    } senao {
      escreva("\nO número ", procurado, " não está no vetor.\n")
    }

    se (comparacoes == 1) {
      escreva("Foi feita 1 comparação.\n")
    } senao {
      escreva("Foram feitas ", comparacoes, " comparações (uma busca elemento por elemento poderia precisar de até ", TAMANHO, ").\n")
    }
  }
}
