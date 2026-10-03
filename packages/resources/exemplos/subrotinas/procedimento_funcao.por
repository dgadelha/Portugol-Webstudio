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
 *   Este exemplo ilustra o uso das funções da linguagem Portugol.
 *
 *   Neste exemplo, foi criado um procedimento que formata uma mensagem qualquer e uma
 *   função que realiza um cálculo matemático entre dois números informados.
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
    mensagem("Bem-vindo") // Chama o procedimento

    escreva("O resultado do primeiro cálculo é: ", calcula(3.0, 4.0)) // Chama a função no escreva
    escreva("\nO resultado do segundo cálculo é: ", calcula(7.0, 2.0), "\n") // Chama a função no escreva

    mensagem("Tchau") // Chama o procedimento
  }

  funcao mensagem(cadeia texto) {
    inteiro i

    // Insere uma linha antes do texto da mensagem
    para (i = 0; i < 50; i++) {
      escreva("-")
    }

    escreva("\n", texto, "\n") // Escreve a mensagem

    // Insere uma linha após o texto da mensagem
    para (i = 0; i < 50; i++) {
      escreva("-")
    }

    escreva("\n")
  }

  // Função que realiza um cálculo e retorna o resultado
  funcao real calcula(real a, real b) {
    real resultado

    resultado = a * a + b * b

    retorne resultado
  }
}
