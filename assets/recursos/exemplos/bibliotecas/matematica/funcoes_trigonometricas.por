/**
 * Este exemplo pede um ângulo em graus e calcula o seno, o cosseno e a
 * tangente dele com as funções da biblioteca "Matematica". Como essas funções
 * trabalham com ângulos em radianos, o exemplo mostra também como converter
 * graus em radianos usando a constante PI.
 */

programa {
  inclua biblioteca Matematica --> mat

  funcao inicio() {
    real graus, radianos

    escreva("Digite um ângulo em graus (por exemplo, 30, 45 ou 60): ")
    leia(graus)

    // As funções seno, cosseno e tangente esperam o ângulo em radianos.
    // Uma volta completa tem 360 graus, que equivalem a 2 * PI radianos.
    // Por isso, para converter, multiplicamos por PI e dividimos por 180
    radianos = graus * mat.PI / 180.0

    escreva("\nO ângulo de ", graus, " graus equivale a ", mat.arredondar(radianos, 4), " radianos\n\n")

    // Os resultados são arredondados para 4 casas decimais, pois os cálculos
    // com números reais costumam ter pequenas imprecisões nas últimas casas
    escreva("Seno: ", mat.arredondar(mat.seno(radianos), 4), "\n")
    escreva("Cosseno: ", mat.arredondar(mat.cosseno(radianos), 4), "\n")

    // A tangente é o seno dividido pelo cosseno. Quando o cosseno é zero
    // (como em 90 ou 270 graus), a tangente não existe
    se (mat.arredondar(mat.cosseno(radianos), 4) == 0.0) {
      escreva("Tangente: não existe para este ângulo\n")
    } senao {
      escreva("Tangente: ", mat.arredondar(mat.tangente(radianos), 4), "\n")
    }
  }
}
