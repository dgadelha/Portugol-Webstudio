/**
 * Este exemplo verifica se uma palavra ou frase é um palíndromo, ou seja, se pode ser
 * lida igual de trás para frente, como "Ana" ou "Socorram me subi no onibus em
 * Marrocos". Ele mostra como criar uma função que devolve um valor lógico e como
 * percorrer um texto pelos dois lados com a biblioteca Texto.
 */

programa {
  inclua biblioteca Texto --> tx

  // Monta uma versão do texto só com letras minúsculas e sem espaços, para que
  // "A" e "a" sejam considerados iguais e os espaços não atrapalhem
  funcao cadeia preparar_texto(cadeia texto) {
    cadeia minusculo = tx.caixa_baixa(texto)
    cadeia resultado = ""

    para (inteiro i = 0; i < tx.numero_caracteres(minusculo); i++) {
      caracter c = tx.obter_caracter(minusculo, i)

      se (c != ' ') {
        resultado = resultado + c
      }
    }

    retorne resultado
  }

  // Compara o primeiro caractere com o último, o segundo com o penúltimo, e
  // assim por diante, até as duas posições se encontrarem no meio
  funcao logico e_palindromo(cadeia texto) {
    cadeia limpo = preparar_texto(texto)
    inteiro esquerda = 0
    inteiro direita = tx.numero_caracteres(limpo) - 1

    enquanto (esquerda < direita) {
      se (tx.obter_caracter(limpo, esquerda) != tx.obter_caracter(limpo, direita)) {
        // Basta uma diferença para sabermos a resposta
        retorne falso
      }

      esquerda++
      direita--
    }

    retorne verdadeiro
  }

  funcao inicio() {
    cadeia texto

    escreva("Digite uma palavra ou frase (sem acentos): ")
    leia(texto)

    se (e_palindromo(texto)) {
      escreva("\"", texto, "\" é um palíndromo!\n")
    } senao {
      escreva("\"", texto, "\" não é um palíndromo.\n")
    }
  }
}
