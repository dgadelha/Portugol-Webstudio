/**
 * Este exemplo mostra a diferença entre um procedimento e uma função. O
 * procedimento "linha" apenas executa uma tarefa (desenhar uma linha), enquanto
 * a função "area_retangulo" faz um cálculo e devolve o resultado com "retorne".
 */

programa {
  funcao inicio() {
    real area

    // Para usar um procedimento, basta chamá-lo pelo nome
    linha()
    escreva("Calculadora de áreas\n")
    linha()

    // Uma função devolve um valor, que pode ser guardado em uma variável...
    area = area_retangulo(5.0, 3.0)
    escreva("Um retângulo de 5 por 3 tem área ", area, "\n")

    // ...ou usado diretamente, por exemplo dentro de um "escreva"
    escreva("Um retângulo de 2.5 por 4 tem área ", area_retangulo(2.5, 4.0), "\n")

    linha()
  }

  // Um procedimento é uma função que não devolve nenhum valor. Por isso,
  // não há nenhum tipo entre a palavra "funcao" e o nome dela
  funcao linha() {
    para (inteiro i = 0; i < 30; i++) {
      escreva("-")
    }

    escreva("\n")
  }

  // Esta função recebe dois parâmetros (a base e a altura) e devolve um valor
  // do tipo real. O tipo do valor devolvido é escrito antes do nome da função
  funcao real area_retangulo(real base, real altura) {
    // O "retorne" encerra a função e devolve o resultado para quem a chamou
    retorne base * altura
  }
}
