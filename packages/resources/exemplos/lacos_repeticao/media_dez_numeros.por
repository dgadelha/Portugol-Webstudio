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
 *   Este exemplo pede ao usuário que informe 10 números. Logo após, calcula e exibe
 *   a soma e a média dos números digitados. O exemplo utiliza um laço de repetição
 *   do tipo "enquanto" com um contador, que controla quantas vezes o laço se repete,
 *   e um acumulador, que guarda a soma dos números.
 *
 * Autores:
 *
 *   Giordana Maria da Costa Valle
 *   Carlos Alexandre Krueger
 *
 * Data: 01/06/2013
 */

programa {
  funcao inicio() {
    const inteiro QUANTIDADE = 10

    // O contador começa em 1 e aumenta a cada número lido
    inteiro contador = 1

    // O acumulador precisa começar em zero, pois cada número será somado a ele
    real soma = 0.0
    real numero, media

    enquanto (contador <= QUANTIDADE) {
      escreva("Digite o ", contador, "º número: ")
      leia(numero)

      // Somamos o número digitado ao total já acumulado
      soma = soma + numero

      contador = contador + 1
    }

    // Quando o laço termina, a soma contém todos os números digitados
    media = soma / QUANTIDADE

    escreva("\nA soma dos números é ", soma, "\n")
    escreva("A média dos números é ", media, "\n")
  }
}
