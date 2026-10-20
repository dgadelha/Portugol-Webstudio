programa {
  inclua biblioteca Texto --> tx

  funcao logico e_palindromo(cadeia texto) {
    cadeia minusculo = tx.caixa_baixa(texto)
    cadeia letras = ""

    para (inteiro i = 0; i < tx.numero_caracteres(minusculo); i++) {
      caracter c = tx.obter_caracter(minusculo, i)

      se (c >= 'a' e c <= 'z') {
        letras = letras + c
      }
    }

    inteiro esquerda = 0
    inteiro direita = tx.numero_caracteres(letras) - 1

    enquanto (esquerda < direita) {
      se (tx.obter_caracter(letras, esquerda) != tx.obter_caracter(letras, direita)) {
        retorne falso
      }

      esquerda++
      direita--
    }

    retorne verdadeiro
  }

  funcao inicio() {
    escreva(e_palindromo("Roma, me tem amor."))
  }
}
