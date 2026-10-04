/**
 * Este exemplo guarda o preço de uma bicicleta em uma constante e pergunta ao
 * usuário quanto dinheiro ele já guardou. Depois, calcula quanto ainda falta
 * para comprar a bicicleta. Ele mostra como declarar e usar constantes.
 */

programa {
  funcao inicio() {
    // Uma constante é um valor que não muda durante o programa. Ela é declarada
    // com a palavra "const" e, por costume, seu nome é escrito em letras maiúsculas.
    // Se o preço mudar, basta alterar esta linha
    const inteiro PRECO_BICICLETA = 850

    inteiro valor_guardado, valor_que_falta

    escreva("A bicicleta custa R$ ", PRECO_BICICLETA, "\n")
    escreva("Quantos reais você já guardou? ")
    leia(valor_guardado)

    // A constante pode ser usada em cálculos como qualquer variável,
    // mas não é possível atribuir um novo valor a ela
    valor_que_falta = PRECO_BICICLETA - valor_guardado

    se (valor_que_falta > 0) {
      escreva("Faltam R$ ", valor_que_falta, " para você comprar a bicicleta.\n")
    } senao {
      escreva("Parabéns! Você já tem dinheiro suficiente para comprar a bicicleta.\n")
    }
  }
}
