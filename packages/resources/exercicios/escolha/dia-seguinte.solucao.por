programa {
  funcao inicio() {
    inteiro dia, mes, dias_no_mes = 31

    leia(dia)
    leia(mes)

    escolha (mes) {
      caso 4:
      caso 6:
      caso 9:
      caso 11:
        dias_no_mes = 30
        pare
      caso 2:
        dias_no_mes = 28
        pare
    }

    se (dia < dias_no_mes) {
      dia = dia + 1
    } senao {
      dia = 1
      mes = mes + 1

      se (mes > 12) {
        mes = 1
      }
    }

    escreva(dia, "/", mes, "\n")
  }
}
