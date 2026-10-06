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
 *   Este exemplo pede ao usuário que informe uma letra (caracter). Logo após,
 *   verifica se a letra digitada é uma vogal ou uma consoante e exibe o resultado
 *   ao usuário. Se o caractere digitado não for uma letra de A a Z, o programa
 *   avisa o usuário.
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
    caracter letra

    escreva("Digite uma letra, sem acento: ")
    leia(letra)

    // Primeiro, verifica se o caractere é uma letra de A a Z. Os caracteres podem ser
    // comparados com <, >, <= e >=, que seguem a ordem alfabética
    se (nao ((letra >= 'a' e letra <= 'z') ou (letra >= 'A' e letra <= 'Z'))) {
      escreva("\n'", letra, "' não é uma letra de A a Z\n")
    } senao se (letra == 'A' ou letra == 'E' ou letra == 'I' ou letra == 'O' ou letra == 'U' ou letra == 'a' ou letra == 'e' ou letra == 'i' ou letra == 'o' ou letra == 'u') {
      // O Portugol diferencia caracteres minúsculos e maiúsculos,
      // portanto é preciso verificar ambos os casos
      escreva("\nA letra '", letra, "' é uma vogal\n")
    } senao {
      escreva("\nA letra '", letra, "' é uma consoante\n")
    }
  }
}
