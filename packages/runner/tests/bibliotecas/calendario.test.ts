import { describe, expect, test } from "vitest";
import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Biblioteca: Calendario", () => {
  describe("Constantes", () => {
    test("Constantes de dias da semana", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(
                  Calendario.DIA_DOMINGO, " ",
                  Calendario.DIA_SEGUNDA_FEIRA, " ",
                  Calendario.DIA_TERCA_FEIRA, " ",
                  Calendario.DIA_QUARTA_FEIRA, " ",
                  Calendario.DIA_QUINTA_FEIRA, " ",
                  Calendario.DIA_SEXTA_FEIRA, " ",
                  Calendario.DIA_SABADO
                )
              }
            }
          `,
        ),
      ).resolves.toBe("1 2 3 4 5 6 7");
    });

    test("Constantes de meses", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(
                  Calendario.MES_JANEIRO, " ",
                  Calendario.MES_FEVEREIRO, " ",
                  Calendario.MES_MARCO, " ",
                  Calendario.MES_ABRIL, " ",
                  Calendario.MES_MAIO, " ",
                  Calendario.MES_JUNHO, " ",
                  Calendario.MES_JULHO, " ",
                  Calendario.MES_AGOSTO, " ",
                  Calendario.MES_SETEMBRO, " ",
                  Calendario.MES_OUTUBRO, " ",
                  Calendario.MES_NOVEMBRO, " ",
                  Calendario.MES_DEZEMBRO
                )
              }
            }
          `,
        ),
      ).resolves.toBe("1 2 3 4 5 6 7 8 9 10 11 12");
    });
  });

  describe("Funções", () => {
    test("ano_atual", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.ano_atual() >= 2024 e Calendario.ano_atual() <= 2100)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("dia_mes_atual", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.dia_mes_atual() >= 1 e Calendario.dia_mes_atual() <= 31)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("dia_semana_atual", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.dia_semana_atual() >= 1 e Calendario.dia_semana_atual() <= 7)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("mes_atual", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.mes_atual() >= 1 e Calendario.mes_atual() <= 12)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("hora_atual (24h)", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.hora_atual(falso) >= 0 e Calendario.hora_atual(falso) <= 23)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("hora_atual (12h)", async () => {
      await expect(
        runPortugolCode(
          portugol`
          programa {
            inclua biblioteca Calendario

            funcao inicio() {
              escreva(Calendario.hora_atual(verdadeiro) >= 0 e Calendario.hora_atual(verdadeiro) <= 11)
            }
          }
        `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("minuto_atual", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.minuto_atual() >= 0 e Calendario.minuto_atual() <= 59)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("segundo_atual", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.segundo_atual() >= 0 e Calendario.segundo_atual() <= 59)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("milisegundo_atual", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.milisegundo_atual() >= 0 e Calendario.milisegundo_atual() <= 999)
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro");
    });

    test("dia_semana_completo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(
                  Calendario.dia_semana_completo(Calendario.DIA_SEGUNDA_FEIRA, falso, falso), "|",
                  Calendario.dia_semana_completo(Calendario.DIA_SEGUNDA_FEIRA, verdadeiro, falso), "|",
                  Calendario.dia_semana_completo(Calendario.DIA_SEGUNDA_FEIRA, falso, verdadeiro)
                )
              }
            }
          `,
        ),
      ).resolves.toBe("Segunda-Feira|SEGUNDA-FEIRA|segunda-feira");
    });

    test("dia_semana_curto", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(
                  Calendario.dia_semana_curto(Calendario.DIA_TERCA_FEIRA, falso, falso), "|",
                  Calendario.dia_semana_curto(Calendario.DIA_TERCA_FEIRA, verdadeiro, falso), "|",
                  Calendario.dia_semana_curto(Calendario.DIA_TERCA_FEIRA, falso, verdadeiro)
                )
              }
            }
          `,
        ),
      ).resolves.toBe("Terça|TERÇA|terça");
    });

    test("dia_semana_abreviado", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(
                  Calendario.dia_semana_abreviado(Calendario.DIA_QUARTA_FEIRA, falso, falso), "|",
                  Calendario.dia_semana_abreviado(Calendario.DIA_QUARTA_FEIRA, verdadeiro, falso), "|",
                  Calendario.dia_semana_abreviado(Calendario.DIA_QUARTA_FEIRA, falso, verdadeiro)
                )
              }
            }
          `,
        ),
      ).resolves.toBe("Qua|QUA|qua");
    });
  });

  describe("Nomes dos dias da semana", () => {
    test("Lista todos os dias por extenso", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                inteiro i
                para (i = 1; i <= 7; i++) {
                  escreva(Calendario.dia_semana_completo(i, falso, falso), " ")
                }
              }
            }
          `,
        ),
      ).resolves.toBe("Domingo Segunda-Feira Terça-Feira Quarta-Feira Quinta-Feira Sexta-Feira Sabado ");
    });

    test("Lista todos os dias na forma curta", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                inteiro i
                para (i = 1; i <= 7; i++) {
                  escreva(Calendario.dia_semana_curto(i, falso, falso), " ")
                }
              }
            }
          `,
        ),
      ).resolves.toBe("Domingo Segunda Terça Quarta Quinta Sexta Sabado ");
    });

    test("Lista todos os dias abreviados", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                inteiro i
                para (i = 1; i <= 7; i++) {
                  escreva(Calendario.dia_semana_abreviado(i, falso, falso), " ")
                }
              }
            }
          `,
        ),
      ).resolves.toBe("Dom Seg Ter Qua Qui Sex Sab ");
    });

    test("Caixa alta tem prioridade sobre caixa baixa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.dia_semana_completo(2, verdadeiro, verdadeiro), "|", Calendario.dia_semana_curto(3, verdadeiro, verdadeiro))
              }
            }
          `,
        ),
      ).resolves.toBe("SEGUNDA-FEIRA|TERÇA");
    });

    test("Usa as constantes de dia", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.dia_semana_completo(Calendario.DIA_DOMINGO, falso, falso), "|", Calendario.dia_semana_abreviado(Calendario.DIA_SABADO, falso, falso))
              }
            }
          `,
        ),
      ).resolves.toBe("Domingo|Sab");
    });

    test("Dia acima de sete interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva("antes ")
                escreva(Calendario.dia_semana_completo(8, falso, falso))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Dia zero interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva("antes ")
                escreva(Calendario.dia_semana_curto(0, falso, falso))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });

    test("Dia negativo interrompe o programa", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva("antes ")
                escreva(Calendario.dia_semana_abreviado(0 - 1, falso, falso))
                escreva("depois")
              }
            }
          `,
        ),
      ).resolves.toBe("antes ");
    });
  });

  describe("Relógio", () => {
    test("Hora em 12 horas nunca passa de 11", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Calendario

              funcao inicio() {
                escreva(Calendario.hora_atual(verdadeiro) < 12, "|", Calendario.hora_atual(verdadeiro) <= Calendario.hora_atual(falso))
              }
            }
          `,
        ),
      ).resolves.toBe("verdadeiro|verdadeiro");
    });
  });
});
