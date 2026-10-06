/**
 * Este exemplo mostra o cardápio de uma lanchonete e usa o comando "escolha"
 * para exibir o preço do item escolhido pelo usuário. Ele mostra como o
 * "escolha" compara um valor com vários casos, e o papel do "pare" e do
 * "caso contrario".
 */

programa {
  funcao inicio() {
    inteiro opcao

    escreva("Cardápio da lanchonete\n")
    escreva("1) Pastel\n")
    escreva("2) Coxinha\n")
    escreva("3) Pão de queijo\n")
    escreva("4) Suco\n\n")

    escreva("Escolha um item: ")
    leia(opcao)

    escreva("\n")

    // O "escolha" compara o valor da variável com cada "caso", de cima para baixo,
    // e executa as instruções do caso que for igual a ela
    escolha (opcao) {
      caso 1:
        escreva("Você escolheu pastel. O preço é R$ 7,00.\n")
        // O "pare" encerra o "escolha". Sem ele, as instruções do próximo
        // caso também seriam executadas
        pare
      caso 2:
        escreva("Você escolheu coxinha. O preço é R$ 6,00.\n")
        pare
      caso 3:
        escreva("Você escolheu pão de queijo. O preço é R$ 4,50.\n")
        pare
      caso 4:
        escreva("Você escolheu suco. O preço é R$ 5,00.\n")
        pare
      // O "caso contrario" é executado quando o valor não é igual a nenhum dos casos
      caso contrario:
        escreva("A opção ", opcao, " não existe no cardápio.\n")
    }
  }
}
