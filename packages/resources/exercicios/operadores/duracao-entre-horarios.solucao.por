programa {
  funcao inicio() {
    inteiro hora_inicio, minuto_inicio, hora_fim, minuto_fim, duracao

    leia(hora_inicio, minuto_inicio, hora_fim, minuto_fim)

    duracao = (hora_fim * 60 + minuto_fim - (hora_inicio * 60 + minuto_inicio) + 1440) % 1440

    escreva(duracao / 60, " h ", duracao % 60, " min\n")
  }
}
