/**
 * Este exemplo pede o dia e o mês do seu aniversário e usa a data atual, obtida
 * com a biblioteca "Calendario", para calcular quantos dias faltam para o
 * próximo. Ele mostra como lidar com meses de tamanhos diferentes e com os anos
 * bissextos, em que fevereiro tem 29 dias.
 */

programa {
  inclua biblioteca Calendario --> c

  funcao inicio() {
    inteiro dia, mes

    escreva("Em que mês você faz aniversário (1 a 12)? ")
    leia(mes)

    enquanto (mes < 1 ou mes > 12) {
      escreva("Mês inválido. Digite um número de 1 a 12: ")
      leia(mes)
    }

    // Para validar o dia usamos 2024, um ano bissexto, para que quem nasceu em
    // 29 de fevereiro também possa digitar o seu aniversário
    escreva("E em que dia (1 a ", dias_no_mes(mes, 2024), ")? ")
    leia(dia)

    enquanto (dia < 1 ou dia > dias_no_mes(mes, 2024)) {
      escreva("Dia inválido. Digite um número de 1 a ", dias_no_mes(mes, 2024), ": ")
      leia(dia)
    }

    // O cálculo fica em uma função que recebe a data de hoje. Assim podemos
    // testá-lo com qualquer data, e não só com a data em que o programa roda
    inteiro faltam = dias_ate_aniversario(c.dia_mes_atual(), c.mes_atual(), c.ano_atual(), dia, mes)

    se (faltam == 0) {
      escreva("\nO seu aniversário é hoje. Parabéns!\n")
    } senao se (faltam == 1) {
      escreva("\nFalta só 1 dia para o seu aniversário!\n")
    } senao {
      escreva("\nFaltam ", faltam, " dias para o seu aniversário.\n")
    }
  }

  // Calcula quantos dias faltam da data de hoje até o próximo aniversário
  funcao inteiro dias_ate_aniversario(inteiro dia_hoje, inteiro mes_hoje, inteiro ano, inteiro dia, inteiro mes) {
    // A ideia é transformar cada data no seu número dentro do ano: 1º de janeiro
    // é o dia 1, 1º de fevereiro é o dia 32, 31 de dezembro é o dia 365 (ou 366)
    inteiro hoje = dia_do_ano(dia_hoje, mes_hoje, ano)
    inteiro aniversario = dia_do_ano(dia, mes, ano)

    // Se o aniversário ainda não passou neste ano, basta subtrair
    se (aniversario >= hoje) {
      retorne aniversario - hoje
    }

    // Se já passou, contamos os dias que restam neste ano e somamos os dias do
    // ano que vem até o aniversário
    inteiro restam_neste_ano = dias_no_ano(ano) - hoje

    retorne restam_neste_ano + dia_do_ano(dia, mes, ano + 1)
  }

  // Soma os dias de todos os meses anteriores ao mês informado e depois o dia.
  // Quem nasceu em 29 de fevereiro cai no dia 60, que em um ano não bissexto é
  // 1º de março: é nesse dia que o aniversário é contado nesses anos
  funcao inteiro dia_do_ano(inteiro dia, inteiro mes, inteiro ano) {
    inteiro total = 0

    para (inteiro m = 1; m < mes; m++) {
      total = total + dias_no_mes(m, ano)
    }

    retorne total + dia
  }

  // Abril, junho, setembro e novembro têm 30 dias; fevereiro tem 28, ou 29 nos
  // anos bissextos; os demais meses têm 31
  funcao inteiro dias_no_mes(inteiro mes, inteiro ano) {
    se (mes == 2) {
      se (eh_bissexto(ano)) {
        retorne 29
      }

      retorne 28
    }

    se (mes == 4 ou mes == 6 ou mes == 9 ou mes == 11) {
      retorne 30
    }

    retorne 31
  }

  funcao inteiro dias_no_ano(inteiro ano) {
    se (eh_bissexto(ano)) {
      retorne 366
    }

    retorne 365
  }

  // Um ano é bissexto se for divisível por 4, exceto os divisíveis por 100 que
  // não são divisíveis por 400. Por isso 2024 e 2000 são bissextos, mas 1900 não
  funcao logico eh_bissexto(inteiro ano) {
    retorne (ano % 4 == 0 e ano % 100 != 0) ou ano % 400 == 0
  }
}
