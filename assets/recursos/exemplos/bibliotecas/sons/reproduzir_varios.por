/**
 * Este exemplo demonstra como reproduzir vários sons, inclusive ao mesmo tempo,
 * utilizando a biblioteca "Sons". Para isso, o programa toca uma batida simples de
 * bateria com bumbo, caixa e chimbal. Os sons ficam na mesma pasta do exemplo.
 */

programa {
  inclua biblioteca Sons --> s
  inclua biblioteca Util --> u

  funcao inicio() {
    // Cada som carregado tem o seu próprio endereço
    inteiro bumbo = s.carregar_som("bumbo.mp3")
    inteiro caixa = s.carregar_som("caixa.mp3")
    inteiro chimbal = s.carregar_som("chimbal.mp3")

    escreva("Tocando uma batida de bateria...\n")

    para (inteiro compasso = 1; compasso <= 4; compasso++) {
      para (inteiro tempo = 1; tempo <= 4; tempo++) {
        // O chimbal toca em todos os tempos
        s.reproduzir_som(chimbal, falso)

        // Sons diferentes podem tocar ao mesmo tempo: o bumbo toca junto com
        // o chimbal nos tempos ímpares, e a caixa nos tempos pares
        se (tempo % 2 == 1) {
          s.reproduzir_som(bumbo, falso)
        } senao {
          s.reproduzir_som(caixa, falso)
        }

        u.aguarde(300)
      }
    }

    s.liberar_som(bumbo)
    s.liberar_som(caixa)
    s.liberar_som(chimbal)
  }
}
