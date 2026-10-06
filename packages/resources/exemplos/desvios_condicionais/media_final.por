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
 *   Este exemplo pede ao usuário que informe seu nome e três notas. Logo após,
 *   calcula a média final do usuário e exibe uma mensagem informando se ele foi
 *   aprovado ou reprovado.
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
    cadeia nome
    real nota1, nota2, nota3, media

    escreva("Digite seu nome: ")
    leia(nome)

    escreva("\n")

    escreva("Digite a primeira nota: ")
    leia(nota1)

    escreva("Digite a segunda nota: ")
    leia(nota2)

    escreva("Digite a terceira nota: ")
    leia(nota3)

    /* Calcula a média final do usuário, com no máximo duas casas decimais.
     * A aprovação é decidida com a média já arredondada: sem isso, as notas
     * 6, 6 e 5.99 dariam 5.9966..., que aparece como 6.0 na tela, e o aluno
     * seria reprovado mesmo vendo a média 6.0 */
    media = mat.arredondar((nota1 + nota2 + nota3) / 3, 2)

    limpa()

    se (media >= 6) {
      escreva("Parabéns, ", nome, "!\nVocê foi aprovado com a média ", media)
    } senao {
      escreva("Que pena, ", nome, "!\nVocê foi reprovado com a média ", media)
    }

    escreva("\n")
  }
}
