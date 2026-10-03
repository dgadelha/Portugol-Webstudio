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
 *   Este exemplo demonstra como utilizar as funções da biblioteca "Tipos" para verificar
 *   e converter dados do tipo caracter para outros tipos e vice-versa.
 *
 * Autores:
 *
 *   Luiz Fernando Noschang (noschang@univali.br)
 *
 * Data: 18/07/2014
 */

programa {
  inclua biblioteca Tipos --> tp

  funcao inicio() {
    caracter car

    cadeia cad1 = "Olá"
    cadeia cad2 = "A"

    inteiro num1 = 34
    inteiro num2 = 9

    // Aqui utilizamos a função "cadeia_e_caracter" para verificar se uma cadeia
    // representa um caractere. A cadeia só irá representar um caractere se o seu
    // tamanho for exatamente igual a 1.
    //
    // Neste caso, será retornado falso, pois o valor contido na variável possui
    // mais de um caractere
    se (tp.cadeia_e_caracter(cad1)) {
      escreva("A cadeia \"", cad1, "\" representa um caractere\n")
    }

    // Aqui repetimos o teste feito anteriormente, mas neste caso, será retornado
    // verdadeiro, pois o valor contido na variável possui apenas um caractere
    se (tp.cadeia_e_caracter(cad2)) {
      escreva("A cadeia \"", cad2, "\" representa um caractere\n")

      // Agora que já sabemos que esta cadeia representa um caractere, podemos
      // convertê-la em um caracter e utilizá-lo normalmente
      car = tp.cadeia_para_caracter(cad2)

      escolha (car) {
        caso 'A':
          escreva("O caractere convertido é a letra A\n")
          pare
        caso contrario:
          escreva("O caractere convertido não é a letra A\n")
      }
    }

    // Um caractere também pode representar um dígito. A função "caracter_e_inteiro"
    // verifica se o caractere é um dígito de 0 a 9, e a função "caracter_para_inteiro"
    // converte esse dígito no número correspondente
    car = '7'

    se (tp.caracter_e_inteiro(car)) {
      escreva("\nO caractere '", car, "' representa o número ", tp.caracter_para_inteiro(car), "\n")
    }

    // O caminho inverso também é possível. A função "inteiro_e_caracter" verifica se
    // um número inteiro tem um único dígito (de 0 a 9) e, portanto, pode ser
    // convertido em um caractere
    se (tp.inteiro_e_caracter(num1)) {
      escreva("O número ", num1, " pode ser convertido em um caractere\n")
    } senao {
      escreva("O número ", num1, " não pode ser convertido em um caractere, pois tem mais de um dígito\n")
    }

    se (tp.inteiro_e_caracter(num2)) {
      // Como o número tem um único dígito, usamos a função "inteiro_para_caracter"
      // para convertê-lo
      car = tp.inteiro_para_caracter(num2)
      escreva("O número ", num2, " foi convertido no caractere '", car, "'\n")
    }

    // Por último, a função "caracter_para_cadeia" converte um caractere em uma cadeia
    cadeia texto = tp.caracter_para_cadeia(car)
    escreva("O caractere '", car, "' foi convertido na cadeia \"", texto, "\"\n")
  }
}
