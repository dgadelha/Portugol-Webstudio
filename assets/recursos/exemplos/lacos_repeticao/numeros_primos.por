/**
 * Este exemplo lê um número N e mostra todos os números primos de 2 até N.
 * Ele mostra como usar um laço dentro de outro e como interromper um laço
 * mais cedo com o comando "pare".
 */

programa {
  funcao inicio() {
    inteiro limite
    inteiro quantidade = 0

    escreva("Mostrar os números primos até: ")
    leia(limite)

    se (limite < 2) {
      escreva("Não existem números primos menores que 2.\n")
    } senao {
      escreva("Números primos de 2 até ", limite, ":\n")

      // O laço de fora passa por cada número que queremos testar
      para (inteiro numero = 2; numero <= limite; numero++) {
        // Um número é primo quando só é divisível por 1 e por ele mesmo.
        // Começamos supondo que ele é primo e procuramos um divisor
        logico primo = verdadeiro

        // O laço de dentro testa os possíveis divisores. Basta testar até a
        // raiz quadrada do número (divisor * divisor <= numero): se houvesse um
        // divisor maior, haveria também um menor, que já teria sido encontrado
        para (inteiro divisor = 2; divisor * divisor <= numero; divisor++) {
          se (numero % divisor == 0) {
            // Achamos um divisor, então o número não é primo. Não adianta
            // continuar testando: o "pare" encerra o laço de dentro na hora
            primo = falso
            pare
          }
        }

        se (primo) {
          escreva(numero, " ")
          quantidade++
        }
      }

      escreva("\n\nTotal: ", quantidade, " ")

      se (quantidade == 1) {
        escreva("número primo.\n")
      } senao {
        escreva("números primos.\n")
      }
    }
  }
}
