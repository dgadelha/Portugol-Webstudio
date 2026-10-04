/**
 * Este exemplo mostra a diferença entre passar um parâmetro por valor e por
 * referência. As duas funções dobram o número recebido, mas só a que recebe
 * o parâmetro por referência (com o símbolo &) altera a variável original.
 */

programa {
  funcao inicio() {
    inteiro numero = 10

    escreva("Valor inicial da variável: ", numero, "\n\n")

    // Passagem por valor: a função recebe uma cópia do valor da variável
    dobrar_por_valor(numero)
    escreva("Depois de dobrar_por_valor, a variável vale: ", numero, "\n\n")

    // Passagem por referência: a função recebe um atalho para a própria
    // variável, então o que ela altera vale também aqui fora
    dobrar_por_referencia(numero)
    escreva("Depois de dobrar_por_referencia, a variável vale: ", numero, "\n")
  }

  // Sem o &, o parâmetro "valor" é uma cópia. Alterar a cópia não muda
  // a variável que foi passada na chamada
  funcao dobrar_por_valor(inteiro valor) {
    valor = valor * 2
    escreva("  Dentro de dobrar_por_valor, o parâmetro vale: ", valor, "\n")
  }

  // Com o &, o parâmetro "valor" é a própria variável que foi passada
  // na chamada. Alterar o parâmetro altera a variável original
  funcao dobrar_por_referencia(inteiro &valor) {
    valor = valor * 2
    escreva("  Dentro de dobrar_por_referencia, o parâmetro vale: ", valor, "\n")
  }
}
