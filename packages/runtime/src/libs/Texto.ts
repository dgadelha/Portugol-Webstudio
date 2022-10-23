export default /* javascript */ `{
  numero_caracteres(cadeia) {
    self.runtime.expectType("numero_caracteres", "cadeia", cadeia, "cadeia", "caracter");

    return new PortugolVar("inteiro", cadeia.value.length);
  },

  caixa_alta(cad) {
    self.runtime.expectType("caixa_alta", "cad", cad, "cadeia", "caracter");

    return new PortugolVar("cadeia", cad.value.toUpperCase());
  },

  caixa_baixa(cad) {
    self.runtime.expectType("caixa_baixa", "cad", cad, "cadeia", "caracter");

    return new PortugolVar("cadeia", cad.value.toLowerCase());
  },

  substituir(cad, texto_pesquisa, texto_substituto) {
    self.runtime.expectType("substituir", "cad", cad, "cadeia", "caracter");
    self.runtime.expectType("substituir", "texto_pesquisa", texto_pesquisa, "cadeia", "caracter");
    self.runtime.expectType("substituir", "texto_substituto", texto_substituto, "cadeia", "caracter");

    return new PortugolVar("cadeia", cad.value.replaceAll(texto_pesquisa.value, texto_substituto.value));
  },

  preencher_a_esquerda(car, tamanho, cad) {
    self.runtime.expectType("preencher_a_esquerda", "car", car, "cadeia", "caracter");
    self.runtime.expectType("preencher_a_esquerda", "tamanho", tamanho, "inteiro", "real");
    self.runtime.expectType("preencher_a_esquerda", "cad", cad, "cadeia", "caracter");

    return new PortugolVar("cadeia", cad.value.padStart(tamanho.value, car.value));
  },

  preencher_a_direita(car, tamanho, cad) {
    self.runtime.expectType("preencher_a_direita", "car", car, "cadeia", "caracter");
    self.runtime.expectType("preencher_a_direita", "tamanho", tamanho, "inteiro", "real");
    self.runtime.expectType("preencher_a_direita", "cad", cad, "cadeia", "caracter");

    return new PortugolVar("cadeia", cad.value.padEnd(tamanho.value, car.value));
  },

  obter_caracter(cad, indice) {
    self.runtime.expectType("obter_caracter", "cad", cad, "cadeia", "caracter");
    self.runtime.expectType("obter_caracter", "indice", indice, "inteiro", "real");

    if (indice.value < 0) {
      throw new Error("O índice do caracter (" + indice.value + ") é menor que 0");
    } else if (indice.value > cad.value.length - 1) {
      throw new Error("O índice do caracter (" + indice.value + ") é maior que o número de caracteres na cadeia (" + cad.value.length + ")");
    }

    return new PortugolVar("caracter", cad.value.charAt(indice.value));
  },

  posicao_texto(texto, cadeia, posicao_inicial) {
    self.runtime.expectType("posicao_texto", "texto", texto, "cadeia", "caracter");
    self.runtime.expectType("posicao_texto", "cadeia", cadeia, "cadeia", "caracter");
    self.runtime.expectType("posicao_texto", "posicao_inicial", posicao_inicial, "inteiro", "real");

    return new PortugolVar("inteiro", cadeia.value.indexOf(texto.value, posicao_inicial.value));
  },

  extrair_subtexto(texto, posicao_inicial, posicao_final) {
    self.runtime.expectType("posicao_texto", "texto", texto, "cadeia", "caracter");
    self.runtime.expectType("posicao_texto", "posicao_inicial", posicao_inicial, "inteiro", "real");
    self.runtime.expectType("posicao_texto", "posicao_final", posicao_final, "inteiro", "real");

    if (posicao_inicial.value < 0 || posicao_final.value < 0 || posicao_inicial.value > posicao_final.value || posicao_final.value > texto.value.length || posicao_inicial.value > texto.value.length) {
      throw new Error("Posição inicial ou final inválida. A posição deve estar entre 0 e o tamanho da cadeia");
    }

    return new PortugolVar("cadeia", texto.value.substring(posicao_inicial.value, posicao_final.value));
  },
}`;
