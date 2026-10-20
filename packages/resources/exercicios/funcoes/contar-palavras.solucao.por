programa {
  inclua biblioteca Texto --> tx

  funcao inteiro contar_palavras(cadeia frase) {
    inteiro palavras = 0
    logico dentro_de_palavra = falso

    para (inteiro i = 0; i < tx.numero_caracteres(frase); i++) {
      se (tx.obter_caracter(frase, i) == ' ') {
        dentro_de_palavra = falso
      } senao se (nao dentro_de_palavra) {
        dentro_de_palavra = verdadeiro
        palavras++
      }
    }

    retorne palavras
  }

  funcao inicio() {
    escreva(contar_palavras("Bom dia, turma"))
  }
}
