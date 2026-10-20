programa {
  inclua biblioteca Texto --> tx

  funcao inteiro contar_vogais(cadeia texto) {
    inteiro vogais = 0
    cadeia minusculo = tx.caixa_baixa(texto)

    para (inteiro i = 0; i < tx.numero_caracteres(minusculo); i++) {
      caracter c = tx.obter_caracter(minusculo, i)

      se (c == 'a' ou c == 'e' ou c == 'i' ou c == 'o' ou c == 'u') {
        vogais++
      }
    }

    retorne vogais
  }

  funcao inicio() {
    escreva(contar_vogais("Portugol"))
  }
}
