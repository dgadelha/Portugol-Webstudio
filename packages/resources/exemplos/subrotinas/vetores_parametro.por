/*
 * Copyright (C) 2014 - UNIVALI - Universidade do Vale do Itajaí
 *
 * Este arquivo de código fonte é livre para utilização, cópia e/ou modificação
 * desde que este cabeçalho, contendo os direitos autorais e a descrição do programa,
 * seja mantido.
 *
 * Se tiver dificuldade em compreender este exemplo, acesse as vídeoaulas do Portugol
 * Studio para auxiliá-lo:
 *
 * https://www.youtube.com/watch?v=K02TnB3IGnQ&list=PLb9yvNDCid3jQAEbNoPHtPR0SWwmRSM-t
 *
 * Descrição:
 *
 *   Este exemplo ilustra a passagem de vetores como parâmetros para uma função.
 *
 *   Variáveis comuns são passadas por valor, a menos que se use o operador '&'.
 *   Já os vetores e as matrizes são sempre passados por referência, mesmo sem o
 *   operador '&': a função recebe uma referência para o vetor original e não uma
 *   cópia dele. Por isso, qualquer alteração feita nos elementos do vetor dentro da
 *   função é refletida no vetor fora dela.
 *
 *   No exemplo, a função "preenche" sorteia os valores do vetor e a função "ordena"
 *   os coloca em ordem crescente. O vetor é exibido antes e depois da ordenação,
 *   mostrando que as alterações feitas pelas funções valem para o vetor original.
 *
 *   Caso não compreenda estes conceitos, experimente alterar o programa e observar
 *   os valores exibidos. Se ainda assim tiver dificuldades, peça a ajuda de um
 *   professor ou de alguém experiente em programação.
 *
 * Autores:
 *
 *   Giordana Maria da Costa Valle
 *   Carlos Alexandre Krueger
 *
 * Data: 01/06/2013
 */

programa {
  inclua biblioteca Util --> util

  funcao inicio() {
    inteiro vet[10] // Declara um vetor com 10 posições

    preenche(vet)

    escreva("Vetor antes da ordenação:\n")
    exibe(vet)

    ordena(vet)

    escreva("\n\nVetor após a ordenação:\n")
    exibe(vet)

    escreva("\n")
  }

  // Preenche o vetor com números aleatórios. Neste caso, o vetor é
  // passado por referência. Vetores não precisam do &, pois eles sempre são
  // passados por referência automaticamente
  funcao preenche(inteiro v[]) {
    para (inteiro i = 0; i < 10; i++) {
      v[i] = util.sorteia(1, 100)
    }
  }

  funcao exibe(inteiro v[]) {
    para (inteiro i = 0; i < 10; i++) {
      escreva(v[i], " ")
    }
  }

  // Ordena o vetor em ordem crescente
  funcao ordena(inteiro v[]) {
    para (inteiro i = 0; i < 10; i++) {
      para (inteiro j = 0; j < 9; j++) {
        se (v[j] > v[j + 1]) {
          troca(v, j, j + 1)
        }
      }
    }
  }

  funcao troca(inteiro v[], inteiro a, inteiro b) {
    inteiro c = v[a]

    v[a] = v[b]
    v[b] = c
  }
}
