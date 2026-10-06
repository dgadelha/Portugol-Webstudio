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
 *   Este exemplo pede ao usuário que informe um ano. Logo após, calcula e exibe a
 *   quantidade de dias que se passaram desde o dia 01/01/0001 (ano 1 d.C.) até o dia
 *   01/01 do ano informado, seguindo as regras dos anos bissextos do calendário
 *   atual.
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
    inteiro ano, anos_completos, anos_bissextos, total_de_dias

    escreva("Informe um ano: ")
    leia(ano)

    // Do ano 1 até o ano informado, passaram-se (ano - 1) anos completos
    anos_completos = ano - 1

    // Um ano bissexto tem 366 dias em vez de 365. Pelas regras do calendário,
    // são bissextos os anos divisíveis por 4, exceto os divisíveis por 100,
    // a menos que também sejam divisíveis por 400.
    //
    // Como a divisão entre dois inteiros descarta as casas decimais, a conta
    // anos_completos / 4 diz quantos múltiplos de 4 existem nesse período.
    // Depois tiramos os múltiplos de 100 e devolvemos os múltiplos de 400
    anos_bissextos = anos_completos / 4 - anos_completos / 100 + anos_completos / 400

    // Cada ano tem 365 dias, e cada ano bissexto tem um dia a mais
    total_de_dias = anos_completos * 365 + anos_bissextos

    escreva("\nDe 01/01/1 até 01/01/", ano, ":\n")
    escreva("Anos completos: ", anos_completos, "\n")
    escreva("Anos bissextos: ", anos_bissextos, "\n")
    escreva("Total de dias: ", total_de_dias, "\n")
  }
}
