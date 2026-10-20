programa {
  funcao inicio() {
    inteiro total, horas, minutos, segundos

    escreva("Duração em segundos: ")
    leia(total)

    horas = total / 3600
    minutos = total % 3600 / 60
    segundos = total % 60

    escreva(horas, " h ", minutos, " min ", segundos, " s\n")
  }
}
