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
 *   Este exemplo pede ao usuário as notas de três provas e calcula a média delas.
 *   Depois, usa um "se" para cada nota para mostrar quais ficaram abaixo da média,
 *   mostrando que vários "se" independentes podem ser verdadeiros ao mesmo tempo.
 *
 * Autores:
 *
 *   Giordana Maria da Costa Valle
 *   Carlos Alexandre Krueger
 *
 * Data: 01/06/2013
 */

programa {
  inclua biblioteca Matematica --> mat

  funcao inicio() {
    real nota1, nota2, nota3, media
    logico alguma_abaixo = falso

    escreva("Digite a nota da prova 1: ")
    leia(nota1)
    escreva("Digite a nota da prova 2: ")
    leia(nota2)
    escreva("Digite a nota da prova 3: ")
    leia(nota3)

    // Os parênteses fazem a soma acontecer antes da divisão. A função "arredondar"
    // deixa a média com no máximo duas casas decimais, e as notas são comparadas
    // com a média já arredondada: sem isso, as notas 0.1, 0.1 e 0.1 dariam a média
    // 0.10000000000000002, e as três apareceriam "abaixo da média"
    media = mat.arredondar((nota1 + nota2 + nota3) / 3, 2)

    escreva("\nA média das notas é ", media, "\n\n")

    // Aqui não usamos "senao": cada "se" é verificado separadamente,
    // então mais de uma mensagem pode ser exibida
    se (nota1 < media) {
      escreva("A nota da prova 1 (", nota1, ") ficou abaixo da média\n")
      alguma_abaixo = verdadeiro
    }

    se (nota2 < media) {
      escreva("A nota da prova 2 (", nota2, ") ficou abaixo da média\n")
      alguma_abaixo = verdadeiro
    }

    se (nota3 < media) {
      escreva("A nota da prova 3 (", nota3, ") ficou abaixo da média\n")
      alguma_abaixo = verdadeiro
    }

    // Isso acontece quando nenhuma nota fica abaixo da média, por exemplo quando
    // as três notas são iguais
    se (nao alguma_abaixo) {
      escreva("Nenhuma nota ficou abaixo da média\n")
    }
  }
}
