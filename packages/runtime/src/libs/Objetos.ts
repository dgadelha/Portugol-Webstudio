export default /* javascript */ `{
  TIPO_INTEIRO: new PortugolVar("inteiro", 1, true),
  TIPO_CADEIA: new PortugolVar("inteiro", 2, true),
  TIPO_CARACTER: new PortugolVar("inteiro", 3, true),
  TIPO_REAL: new PortugolVar("inteiro", 4, true),
  TIPO_LOGICO: new PortugolVar("inteiro", 5, true),
  TIPO_OBJETO: new PortugolVar("inteiro", 6, true),
  TIPO_VETOR: new PortugolVar("inteiro", 7, true),

  criar_objeto() {
    return new PortugolVar("inteiro", self.runtime.objetos.criarObjeto(new PortugolObjeto(new Map(), true)));
  },

  criar_objeto_via_json(json) {
    self.runtime.expectType("criar_objeto_via_json", "json", json, "cadeia");

    return new PortugolVar("inteiro", self.runtime.objetos.criarObjeto(PortugolObjeto.lerJson(json.value)));
  },

  criar_objeto_via_xml(xml) {
    self.runtime.expectType("criar_objeto_via_xml", "xml", xml, "cadeia");

    return new PortugolVar("inteiro", self.runtime.objetos.criarObjeto(PortugolObjeto.lerXml(xml.value)));
  },

  atribuir_propriedade(endereco, propriedade, valor) {
    self.runtime.expectType("atribuir_propriedade", "endereco", endereco, "inteiro");
    self.runtime.expectType("atribuir_propriedade", "propriedade", propriedade, "cadeia");
    self.runtime.expectType("atribuir_propriedade", "valor", valor, "inteiro", "real", "cadeia", "caracter", "logico");

    self.runtime.objetos.obterObjeto(endereco.value).atribuirPropriedade(propriedade.value, {
      tipo: valor.type,
      valor: valor.value,
    });
  },

  obter_propriedade_tipo_inteiro(endereco, propriedade) {
    self.runtime.expectType("obter_propriedade_tipo_inteiro", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_inteiro", "propriedade", propriedade, "cadeia");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);

    return new PortugolVar("inteiro", PortugolObjeto.como(objeto.obterPropriedade(propriedade.value), "inteiro"));
  },

  obter_propriedade_tipo_real(endereco, propriedade) {
    self.runtime.expectType("obter_propriedade_tipo_real", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_real", "propriedade", propriedade, "cadeia");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);

    return new PortugolVar("real", PortugolObjeto.como(objeto.obterPropriedade(propriedade.value), "real"));
  },

  obter_propriedade_tipo_logico(endereco, propriedade) {
    self.runtime.expectType("obter_propriedade_tipo_logico", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_logico", "propriedade", propriedade, "cadeia");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);

    return new PortugolVar("logico", PortugolObjeto.como(objeto.obterPropriedade(propriedade.value), "logico"));
  },

  obter_propriedade_tipo_caracter(endereco, propriedade) {
    self.runtime.expectType("obter_propriedade_tipo_caracter", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_caracter", "propriedade", propriedade, "cadeia");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);

    return new PortugolVar("caracter", PortugolObjeto.comoCaracter(objeto.obterPropriedade(propriedade.value)));
  },

  obter_propriedade_tipo_cadeia(endereco, propriedade) {
    self.runtime.expectType("obter_propriedade_tipo_cadeia", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_cadeia", "propriedade", propriedade, "cadeia");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);

    // O Objeto.java lê o mapa direto aqui, sem checar se a propriedade existe,
    // então uma propriedade inexistente resulta em erro de tipo incompatível
    return new PortugolVar("cadeia", PortugolObjeto.como(objeto.mapa().get(propriedade.value), "cadeia"));
  },

  obter_propriedade_tipo_objeto(endereco, propriedade) {
    self.runtime.expectType("obter_propriedade_tipo_objeto", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_objeto", "propriedade", propriedade, "cadeia");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);
    const filho = PortugolObjeto.como(objeto.obterPropriedade(propriedade.value), "objeto");

    return new PortugolVar("inteiro", self.runtime.objetos.criarObjeto(filho));
  },

  obter_tamanho_vetor_propriedade(endereco, propriedade) {
    self.runtime.expectType("obter_tamanho_vetor_propriedade", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_tamanho_vetor_propriedade", "propriedade", propriedade, "cadeia");

    return new PortugolVar("inteiro", PortugolObjeto.obterVetor(self.runtime.objetos, endereco.value, propriedade.value).length);
  },

  obter_propriedade_tipo_inteiro_em_vetor(endereco, propriedade, indice) {
    self.runtime.expectType("obter_propriedade_tipo_inteiro_em_vetor", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_inteiro_em_vetor", "propriedade", propriedade, "cadeia");
    self.runtime.expectType("obter_propriedade_tipo_inteiro_em_vetor", "indice", indice, "inteiro");

    return new PortugolVar("inteiro", PortugolObjeto.como(PortugolObjeto.obterEmVetor(self.runtime.objetos, endereco.value, propriedade.value, indice.value), "inteiro"));
  },

  obter_propriedade_tipo_real_em_vetor(endereco, propriedade, indice) {
    self.runtime.expectType("obter_propriedade_tipo_real_em_vetor", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_real_em_vetor", "propriedade", propriedade, "cadeia");
    self.runtime.expectType("obter_propriedade_tipo_real_em_vetor", "indice", indice, "inteiro");

    return new PortugolVar("real", PortugolObjeto.como(PortugolObjeto.obterEmVetor(self.runtime.objetos, endereco.value, propriedade.value, indice.value), "real"));
  },

  obter_propriedade_tipo_logico_em_vetor(endereco, propriedade, indice) {
    self.runtime.expectType("obter_propriedade_tipo_logico_em_vetor", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_logico_em_vetor", "propriedade", propriedade, "cadeia");
    self.runtime.expectType("obter_propriedade_tipo_logico_em_vetor", "indice", indice, "inteiro");

    return new PortugolVar("logico", PortugolObjeto.como(PortugolObjeto.obterEmVetor(self.runtime.objetos, endereco.value, propriedade.value, indice.value), "logico"));
  },

  obter_propriedade_tipo_caracter_em_vetor(endereco, propriedade, indice) {
    self.runtime.expectType("obter_propriedade_tipo_caracter_em_vetor", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_caracter_em_vetor", "propriedade", propriedade, "cadeia");
    self.runtime.expectType("obter_propriedade_tipo_caracter_em_vetor", "indice", indice, "inteiro");

    return new PortugolVar("caracter", PortugolObjeto.comoCaracter(PortugolObjeto.obterEmVetor(self.runtime.objetos, endereco.value, propriedade.value, indice.value)));
  },

  obter_propriedade_tipo_cadeia_em_vetor(endereco, propriedade, indice) {
    self.runtime.expectType("obter_propriedade_tipo_cadeia_em_vetor", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_cadeia_em_vetor", "propriedade", propriedade, "cadeia");
    self.runtime.expectType("obter_propriedade_tipo_cadeia_em_vetor", "indice", indice, "inteiro");

    return new PortugolVar("cadeia", PortugolObjeto.como(PortugolObjeto.obterEmVetor(self.runtime.objetos, endereco.value, propriedade.value, indice.value), "cadeia"));
  },

  obter_propriedade_tipo_objeto_em_vetor(endereco, propriedade, indice) {
    self.runtime.expectType("obter_propriedade_tipo_objeto_em_vetor", "endereco", endereco, "inteiro");
    self.runtime.expectType("obter_propriedade_tipo_objeto_em_vetor", "propriedade", propriedade, "cadeia");
    self.runtime.expectType("obter_propriedade_tipo_objeto_em_vetor", "indice", indice, "inteiro");

    const filho = PortugolObjeto.como(PortugolObjeto.obterEmVetor(self.runtime.objetos, endereco.value, propriedade.value, indice.value), "objeto");

    return new PortugolVar("inteiro", self.runtime.objetos.criarObjeto(filho));
  },

  contem_propriedade(endereco, propriedade) {
    self.runtime.expectType("contem_propriedade", "endereco", endereco, "inteiro");
    self.runtime.expectType("contem_propriedade", "propriedade", propriedade, "cadeia");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);

    return new PortugolVar("logico", objeto.contemPropriedade(propriedade.value));
  },

  tipo_propriedade(endereco, propriedade) {
    self.runtime.expectType("tipo_propriedade", "endereco", endereco, "inteiro");
    self.runtime.expectType("tipo_propriedade", "propriedade", propriedade, "cadeia");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);
    const valor = objeto.obterPropriedade(propriedade.value);

    // Nulo, Long e Character não correspondem a nenhum tipo conhecido e dão 0
    switch (valor && valor.tipo) {
      case "cadeia": return new PortugolVar("inteiro", valor.valor.length === 1 ? 3 : 2);
      case "inteiro": return new PortugolVar("inteiro", 1);
      case "real": return new PortugolVar("inteiro", 4);
      case "logico": return new PortugolVar("inteiro", 5);
      case "objeto": return new PortugolVar("inteiro", 6);
      case "vetor": return new PortugolVar("inteiro", 7);
      default: return new PortugolVar("inteiro", 0);
    }
  },

  obter_json(endereco) {
    self.runtime.expectType("obter_json", "endereco", endereco, "inteiro");

    const objeto = self.runtime.objetos.obterObjeto(endereco.value);

    return new PortugolVar("cadeia", PortugolObjeto.serializar({ tipo: "objeto", valor: objeto }));
  },

  liberar_objeto(endereco) {
    self.runtime.expectType("liberar_objeto", "endereco", endereco, "inteiro");

    self.runtime.objetos.liberarObjeto(endereco.value);
  },

  liberar() {
    self.runtime.objetos.liberar();
  },
}`;
