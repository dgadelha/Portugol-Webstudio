/**
 * Este exemplo ordena um vetor de 8 números com o método da bolha (Bubble Sort).
 * A cada passada, os vizinhos fora de ordem trocam de lugar e o maior número
 * "sobe" até o fim do vetor, como uma bolha. O vetor é mostrado depois de cada
 * passada para você acompanhar o processo.
 */

programa {
  // Mostra todos os elementos do vetor em uma linha
  funcao mostrar_vetor(inteiro vetor[], inteiro tamanho) {
    para (inteiro i = 0; i < tamanho; i++) {
      escreva(vetor[i], " ")
    }

    escreva("\n")
  }

  funcao inicio() {
    const inteiro TAMANHO = 8
    inteiro numeros[TAMANHO] = {42, 7, 19, 3, 88, 25, 61, 10}
    inteiro auxiliar
    logico houve_troca

    escreva("Vetor original:   ")
    mostrar_vetor(numeros, TAMANHO)
    escreva("\n")

    // Cada passada leva o maior número que ainda está fora do lugar para o fim.
    // Por isso, com 8 números, bastam no máximo 7 passadas
    para (inteiro passada = 1; passada < TAMANHO; passada++) {
      houve_troca = falso

      // Comparamos cada elemento com o vizinho da direita. Os últimos
      // (passada - 1) elementos já estão no lugar certo e não precisam ser vistos
      para (inteiro i = 0; i < TAMANHO - passada; i++) {
        se (numeros[i] > numeros[i + 1]) {
          // Para trocar dois valores de lugar, precisamos de uma variável
          // auxiliar; sem ela, um dos valores seria perdido
          auxiliar = numeros[i]
          numeros[i] = numeros[i + 1]
          numeros[i + 1] = auxiliar
          houve_troca = verdadeiro
        }
      }

      escreva("Após a passada ", passada, ": ")
      mostrar_vetor(numeros, TAMANHO)

      // Se uma passada inteira não trocou nada, o vetor já está ordenado
      // e podemos parar antes
      se (nao houve_troca) {
        pare
      }
    }

    escreva("\nVetor ordenado:   ")
    mostrar_vetor(numeros, TAMANHO)
  }
}
