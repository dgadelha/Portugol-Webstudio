/**
 * Este exemplo demonstra como utilizar as funções "carregar_som" e "reproduzir_som"
 * da biblioteca "Sons" para tocar um som. Os sons ficam na mesma pasta do exemplo.
 */

programa {
  inclua biblioteca Sons --> s
  inclua biblioteca Util --> u

  funcao inicio() {
    // Carrega o arquivo de som e guarda o seu endereço. O endereço é usado
    // para se referir a este som nas outras funções da biblioteca
    inteiro som = s.carregar_som("caixa.mp3")

    para (inteiro vez = 1; vez <= 4; vez++) {
      escreva("Tocando o som pela ", vez, "ª vez\n")

      // Reproduz o som uma vez (o parâmetro falso indica que o som não deve se repetir)
      s.reproduzir_som(som, falso)
      u.aguarde(500)
    }

    // Libera o som da memória quando ele não for mais utilizado
    s.liberar_som(som)
  }
}
