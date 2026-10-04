/**
 * Este exemplo converte temperaturas entre Celsius, Fahrenheit e Kelvin usando um
 * menu que se repete até você escolher sair. Cada fórmula fica em uma função que
 * recebe um valor real e devolve o resultado, o que deixa o programa principal
 * curto e fácil de ler.
 */

programa {
  inclua biblioteca Matematica --> mat

  funcao real celsius_para_fahrenheit(real celsius) {
    retorne celsius * 9.0 / 5.0 + 32.0
  }

  funcao real fahrenheit_para_celsius(real fahrenheit) {
    retorne (fahrenheit - 32.0) * 5.0 / 9.0
  }

  funcao real celsius_para_kelvin(real celsius) {
    retorne celsius + 273.15
  }

  funcao real kelvin_para_celsius(real kelvin) {
    retorne kelvin - 273.15
  }

  funcao inicio() {
    inteiro opcao
    real valor, resultado

    // O menu é mostrado pelo menos uma vez e se repete até a opção 0
    faca {
      escreva("\nConversor de Temperatura\n")
      escreva("1) Celsius para Fahrenheit\n")
      escreva("2) Fahrenheit para Celsius\n")
      escreva("3) Celsius para Kelvin\n")
      escreva("4) Kelvin para Celsius\n")
      escreva("0) Sair\n")
      escreva("Escolha uma opção: ")
      leia(opcao)

      escolha (opcao) {
        caso 1:
          escreva("Temperatura em °C: ")
          leia(valor)
          resultado = celsius_para_fahrenheit(valor)
          escreva(valor, " °C = ", mat.arredondar(resultado, 2), " °F\n")
          pare
        caso 2:
          escreva("Temperatura em °F: ")
          leia(valor)
          resultado = fahrenheit_para_celsius(valor)
          escreva(valor, " °F = ", mat.arredondar(resultado, 2), " °C\n")
          pare
        caso 3:
          escreva("Temperatura em °C: ")
          leia(valor)
          resultado = celsius_para_kelvin(valor)
          escreva(valor, " °C = ", mat.arredondar(resultado, 2), " K\n")
          pare
        caso 4:
          escreva("Temperatura em K: ")
          leia(valor)
          resultado = kelvin_para_celsius(valor)
          escreva(valor, " K = ", mat.arredondar(resultado, 2), " °C\n")
          pare
        caso 0:
          escreva("Até a próxima!\n")
          pare
        caso contrario:
          escreva("Opção inválida, tente de novo.\n")
      }
    } enquanto (opcao != 0)
  }
}
