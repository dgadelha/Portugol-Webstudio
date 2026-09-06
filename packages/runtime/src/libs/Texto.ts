export default /* javascript */ `{
  numero_caracteres(cadeia) {
    self.runtime.expectType("numero_caracteres", "cadeia", cadeia, "cadeia");

    return new PortugolVar("inteiro", cadeia.value.length);
  },

  caixa_alta(cad) {
    self.runtime.expectType("caixa_alta", "cad", cad, "cadeia");

    return new PortugolVar("cadeia", cad.value.toUpperCase());
  },

  caixa_baixa(cad) {
    self.runtime.expectType("caixa_baixa", "cad", cad, "cadeia");

    return new PortugolVar("cadeia", cad.value.toLowerCase());
  },

  substituir(cad, texto_pesquisa, texto_substituto) {
    self.runtime.expectType("substituir", "cad", cad, "cadeia");
    self.runtime.expectType("substituir", "texto_pesquisa", texto_pesquisa, "cadeia");
    self.runtime.expectType("substituir", "texto_substituto", texto_substituto, "cadeia");

    return new PortugolVar("cadeia", cad.value.replaceAll(texto_pesquisa.value, texto_substituto.value));
  },

  preencher_a_esquerda(car, tamanho, cad) {
    self.runtime.expectType("preencher_a_esquerda", "car", car, "caracter");
    self.runtime.expectType("preencher_a_esquerda", "tamanho", tamanho, "inteiro");
    self.runtime.expectType("preencher_a_esquerda", "cad", cad, "cadeia");

    return new PortugolVar("cadeia", cad.value.padStart(tamanho.value, car.value));
  },

  obter_caracter(cad, indice) {
    self.runtime.expectType("obter_caracter", "cad", cad, "cadeia");
    self.runtime.expectType("obter_caracter", "indice", indice, "inteiro");

    if (indice.value < 0) {
      throw new Error("O índice do caracter (" + indice.value + ") é menor que 0");
    } else if (indice.value > cad.value.length - 1) {
      throw new Error("O índice do caracter (" + indice.value + ") é maior que o número de caracteres na cadeia (" + cad.value.length + ")");
    }

    return new PortugolVar("caracter", cad.value.charAt(indice.value));
  },

  posicao_texto(texto, cadeia, posicao_inicial) {
    self.runtime.expectType("posicao_texto", "texto", texto, "cadeia");
    self.runtime.expectType("posicao_texto", "cadeia", cadeia, "cadeia");
    self.runtime.expectType("posicao_texto", "posicao_inicial", posicao_inicial, "inteiro");

    return new PortugolVar("inteiro", cadeia.value.indexOf(texto.value, posicao_inicial.value));
  },

  extrair_subtexto(cadeia, posicao_inicial, posicao_final) {
    self.runtime.expectType("extrair_subtexto", "cadeia", cadeia, "cadeia");
    self.runtime.expectType("extrair_subtexto", "posicao_inicial", posicao_inicial, "inteiro");
    self.runtime.expectType("extrair_subtexto", "posicao_final", posicao_final, "inteiro");

    // Reproduz as condições em que o String.substring() do Java lança IndexOutOfBoundsException
    if (posicao_inicial.value < 0 || posicao_final.value > cadeia.value.length || posicao_inicial.value > posicao_final.value) {
      throw new Error("Posição inicial ou final inválida. A posição deve estar entre 0 e o tamanho da cadeia");
    }

    return new PortugolVar("cadeia", cadeia.value.substring(posicao_inicial.value, posicao_final.value));
  },
}`;
