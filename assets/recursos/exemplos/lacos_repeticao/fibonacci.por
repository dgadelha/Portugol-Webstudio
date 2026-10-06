/**
 * Este exemplo mostra os N primeiros termos da sequência de Fibonacci, em que cada
 * termo é a soma dos dois anteriores (0, 1, 1, 2, 3, 5, 8...). Ele usa um laço com
 * duas variáveis que "caminham" pela sequência. Na categoria Sub-rotinas há uma
 * versão recursiva deste mesmo programa.
 */

programa {
  funcao inicio() {
    inteiro quantidade

    escreva("Quantos termos da sequência de Fibonacci você quer ver? ")
    leia(quantidade)

    // Os termos crescem muito rápido. Depois do 47º, eles passam do maior valor
    // que uma variável inteiro consegue guardar (2.147.483.647)
    se (quantidade < 1 ou quantidade > 47) {
      escreva("Digite um número de 1 a 47.\n")
    } senao {
      // Guardamos só os dois últimos termos: "anterior" e "atual".
      // A sequência começa com 0 e 1
      inteiro anterior = 0
      inteiro atual = 1
      inteiro proximo

      para (inteiro termo = 1; termo <= quantidade; termo++) {
        escreva(anterior)

        // Coloca uma vírgula entre os termos, mas não depois do último
        se (termo < quantidade) {
          escreva(", ")
        }

        // Agora as duas variáveis andam uma casa para frente:
        // o próximo termo é a soma dos dois atuais, o "atual" passa a ser
        // o "anterior" e o próximo passa a ser o "atual"
        proximo = anterior + atual
        anterior = atual
        atual = proximo
      }

      escreva("\n")
    }
  }
}
