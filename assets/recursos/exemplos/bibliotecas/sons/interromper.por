/**
 * Este exemplo demonstra como interromper um som que está sendo reproduzido,
 * utilizando a função "interromper_som" da biblioteca "Sons". O som é reproduzido
 * em repetição e interrompido depois de alguns segundos. Os sons ficam na mesma
 * pasta do exemplo.
 */

programa {
  inclua biblioteca Sons --> s
  inclua biblioteca Util --> u

  funcao inicio() {
    inteiro som = s.carregar_som("chimbal.mp3")

    // O parâmetro verdadeiro faz com que o som se repita até ser interrompido.
    // A função "reproduzir_som" retorna o endereço desta reprodução, que é
    // usado para interrompê-la depois
    inteiro reproducao = s.reproduzir_som(som, verdadeiro)

    para (inteiro segundos = 3; segundos >= 1; segundos--) {
      escreva("O som será interrompido em ", segundos, "...\n")
      u.aguarde(1000)
    }

    s.interromper_som(reproducao)
    escreva("Som interrompido!\n")

    s.liberar_som(som)
  }
}
