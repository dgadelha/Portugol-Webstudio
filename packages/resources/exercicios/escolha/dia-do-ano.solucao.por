programa {
  funcao inicio() {
    inteiro dia, mes, total

    leia(dia)
    leia(mes)

    total = dia

    // Sem o pare, cada caso continua no de baixo e soma os dias dos meses anteriores
    escolha (mes) {
      caso 12:
        total = total + 30
      caso 11:
        total = total + 31
      caso 10:
        total = total + 30
      caso 9:
        total = total + 31
      caso 8:
        total = total + 31
      caso 7:
        total = total + 30
      caso 6:
        total = total + 31
      caso 5:
        total = total + 30
      caso 4:
        total = total + 31
      caso 3:
        total = total + 28
      caso 2:
        total = total + 31
    }

    escreva(total, "\n")
  }
}
