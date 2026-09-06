export default /* javascript */ `{
  DIA_DOMINGO: new PortugolVar("inteiro", 1, true),
  DIA_SEGUNDA_FEIRA: new PortugolVar("inteiro", 2, true),
  DIA_TERCA_FEIRA: new PortugolVar("inteiro", 3, true),
  DIA_QUARTA_FEIRA: new PortugolVar("inteiro", 4, true),
  DIA_QUINTA_FEIRA: new PortugolVar("inteiro", 5, true),
  DIA_SEXTA_FEIRA: new PortugolVar("inteiro", 6, true),
  DIA_SABADO: new PortugolVar("inteiro", 7, true),

  MES_JANEIRO: new PortugolVar("inteiro", 1, true),
  MES_FEVEREIRO: new PortugolVar("inteiro", 2, true),
  MES_MARCO: new PortugolVar("inteiro", 3, true),
  MES_ABRIL: new PortugolVar("inteiro", 4, true),
  MES_MAIO: new PortugolVar("inteiro", 5, true),
  MES_JUNHO: new PortugolVar("inteiro", 6, true),
  MES_JULHO: new PortugolVar("inteiro", 7, true),
  MES_AGOSTO: new PortugolVar("inteiro", 8, true),
  MES_SETEMBRO: new PortugolVar("inteiro", 9, true),
  MES_OUTUBRO: new PortugolVar("inteiro", 10, true),
  MES_NOVEMBRO: new PortugolVar("inteiro", 11, true),
  MES_DEZEMBRO: new PortugolVar("inteiro", 12, true),

  dia_mes_atual() {
    return new PortugolVar("inteiro", new Date().getDate());
  },

  dia_semana_atual() {
    return new PortugolVar("inteiro", new Date().getDay() + 1);
  },

  mes_atual() {
    return new PortugolVar("inteiro", new Date().getMonth() + 1);
  },

  ano_atual() {
    return new PortugolVar("inteiro", new Date().getFullYear());
  },

  hora_atual(formato_12h) {
    self.runtime.expectType("hora_atual", "formato_12h", formato_12h, "logico");

    const hora = new Date().getHours();

    // O Calendar.HOUR do Java conta de 0 a 11, tanto de madrugada quanto à tarde
    return new PortugolVar("inteiro", formato_12h.value ? hora % 12 : hora);
  },

  minuto_atual() {
    return new PortugolVar("inteiro", new Date().getMinutes());
  },

  segundo_atual() {
    return new PortugolVar("inteiro", new Date().getSeconds());
  },

  milisegundo_atual() {
    return new PortugolVar("inteiro", new Date().getMilliseconds());
  },

  dia_semana_completo(numero_dia, caixa_alta, caixa_baixa) {
    self.runtime.expectType("dia_semana_completo", "numero_dia", numero_dia, "inteiro");
    self.runtime.expectType("dia_semana_completo", "caixa_alta", caixa_alta, "logico");
    self.runtime.expectType("dia_semana_completo", "caixa_baixa", caixa_baixa, "logico");

    if (numero_dia.value < 1 || numero_dia.value > 7) {
      throw new Error("'" + numero_dia.value + "' não corresponde a um dia da semana válido.");
    }

    const dias = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sabado"];
    let dia = dias[numero_dia.value - 1];

    if (caixa_alta.value) {
      dia = dia.toUpperCase();
    } else if (caixa_baixa.value) {
      dia = dia.toLowerCase();
    }

    return new PortugolVar("cadeia", dia);
  },

  dia_semana_curto(numero_dia, caixa_alta, caixa_baixa) {
    self.runtime.expectType("dia_semana_curto", "numero_dia", numero_dia, "inteiro");
    self.runtime.expectType("dia_semana_curto", "caixa_alta", caixa_alta, "logico");
    self.runtime.expectType("dia_semana_curto", "caixa_baixa", caixa_baixa, "logico");

    if (numero_dia.value < 1 || numero_dia.value > 7) {
      throw new Error("'" + numero_dia.value + "' não corresponde a um dia da semana válido.");
    }

    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabado"];
    let dia = dias[numero_dia.value - 1];

    if (caixa_alta.value) {
      dia = dia.toUpperCase();
    } else if (caixa_baixa.value) {
      dia = dia.toLowerCase();
    }

    return new PortugolVar("cadeia", dia);
  },

  dia_semana_abreviado(numero_dia, caixa_alta, caixa_baixa) {
    self.runtime.expectType("dia_semana_abreviado", "numero_dia", numero_dia, "inteiro");
    self.runtime.expectType("dia_semana_abreviado", "caixa_alta", caixa_alta, "logico");
    self.runtime.expectType("dia_semana_abreviado", "caixa_baixa", caixa_baixa, "logico");

    if (numero_dia.value < 1 || numero_dia.value > 7) {
      throw new Error("'" + numero_dia.value + "' não corresponde a um dia da semana válido.");
    }

    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    let dia = dias[numero_dia.value - 1];

    if (caixa_alta.value) {
      dia = dia.toUpperCase();
    } else if (caixa_baixa.value) {
      dia = dia.toLowerCase();
    }

    return new PortugolVar("cadeia", dia);
  },
}`;
