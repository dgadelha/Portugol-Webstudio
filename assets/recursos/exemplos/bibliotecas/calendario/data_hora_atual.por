/**
 * Este exemplo mostra como usar a biblioteca "Calendario" para obter a data e a
 * hora atuais do computador e exibi-las em um formato amigável, como
 * "Hoje é sábado, 3 de outubro de 2026, 14:05".
 */

programa {
  inclua biblioteca Calendario --> c
  inclua biblioteca Texto --> tx
  inclua biblioteca Tipos --> tp

  // A biblioteca devolve o dia da semana e o mês como números. Para mostrar os
  // seus nomes, usamos vetores: o dia 1 (domingo) fica na posição 0, o dia 2 na
  // posição 1, e assim por diante. O mesmo vale para os meses
  //
  // A biblioteca também tem a função "dia_semana_completo", que retorna o nome do
  // dia da semana, mas ela escreve "Sabado" sem acento. Com o nosso vetor, o nome
  // sai do jeito que queremos
  cadeia nomes_dias[7] = {
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado"
  }

  cadeia nomes_meses[12] = {
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  }

  funcao inicio() {
    // Cada função retorna uma parte da data ou da hora atual como um número inteiro
    inteiro dia_semana = c.dia_semana_atual()   // de 1 (domingo) a 7 (sábado)
    inteiro dia = c.dia_mes_atual()
    inteiro mes = c.mes_atual()
    inteiro ano = c.ano_atual()
    inteiro hora = c.hora_atual(falso)          // falso: de 0 a 23, e não de 0 a 11
    inteiro minuto = c.minuto_atual()

    escrever_data(dia_semana, dia, mes, ano, hora, minuto)
  }

  // Recebe as partes da data e da hora e as exibe em dois formatos
  funcao escrever_data(inteiro dia_semana, inteiro dia, inteiro mes, inteiro ano, inteiro hora, inteiro minuto) {
    // Os vetores começam na posição 0, por isso subtraímos 1 dos números
    escreva("Hoje é ", nomes_dias[dia_semana - 1], ", ", dia, " de ", nomes_meses[mes - 1], " de ", ano)
    escreva(", ", dois_digitos(hora), ":", dois_digitos(minuto), "\n")

    // O mesmo momento no formato numérico, com dia e mês sempre com dois dígitos
    escreva("Em números: ", dois_digitos(dia), "/", dois_digitos(mes), "/", ano, "\n")
  }

  // Converte o número em texto e completa com um zero à esquerda quando ele tem
  // só um dígito. Assim, 5 vira "05", e 14:5 vira 14:05
  funcao cadeia dois_digitos(inteiro numero) {
    retorne tx.preencher_a_esquerda('0', 2, tp.inteiro_para_cadeia(numero, 10))
  }
}
