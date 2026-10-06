/**
 * Este exemplo guarda o nome, a idade e a cidade de algumas pessoas em três
 * vetores e exibe esses dados em forma de lista. Ele mostra como usar vetores
 * paralelos: a mesma posição em cada vetor guarda os dados da mesma pessoa.
 */

programa {
  funcao inicio() {
    const inteiro PESSOAS = 5

    // Cada vetor guarda um tipo de informação. Os dados da primeira pessoa
    // ficam na posição 0 de todos os vetores, os da segunda na posição 1, e
    // assim por diante. Por isso a ordem dos valores é importante
    cadeia nome[PESSOAS] = {"Ana", "Bruno", "Carla", "Diego", "Elisa"}
    inteiro idade[PESSOAS] = {19, 22, 18, 25, 20}
    cadeia cidade[PESSOAS] = {"Recife", "Manaus", "Curitiba", "Salvador", "Goiânia"}

    escreva("Cadastro de participantes\n")
    escreva("-------------------------\n")

    // Um único laço percorre os três vetores ao mesmo tempo, usando a
    // mesma posição em cada um deles
    para (inteiro posicao = 0; posicao < PESSOAS; posicao++) {
      escreva(posicao + 1, ". ", nome[posicao], ", ", idade[posicao], " anos, mora em ", cidade[posicao], "\n")
    }

    // Para encontrar os dados de uma pessoa, basta saber a sua posição
    escreva("\nA terceira pessoa da lista é ", nome[2], ", de ", cidade[2], ".\n")
  }
}
