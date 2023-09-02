export default /* javascript */ `{
  obter_diretorio_usuario() {
    return new PortugolVar("cadeia", "/home");
  },

  aguarde(intervalo) {
    self.runtime.expectType("aguarde", "intervalo", intervalo, "inteiro", "real");

    return new Promise(resolve => setTimeout(() => resolve(new PortugolVar("vazio")), intervalo.value));
  },

  tempo_decorrido() {
    return new PortugolVar("inteiro", Date.now() - self.runtime.libs.Util.__loadedAt);
  },

  sorteia(minimo, maximo) {
    self.runtime.expectType("sorteia", "minimo", minimo, "inteiro", "real");
    self.runtime.expectType("sorteia", "maximo", maximo, "inteiro", "real");

    if (minimo.value > maximo.value) {
      throw new Error("O valor mínimo (" + minimo.value + ") é maior do que o valor máximo (" + maximo.value + ")");
    } else if (minimo.value === maximo.value) {
      throw new Error("Os valores mínimo e máximo são iguais: " + minimo.value);
    }

    return new PortugolVar("inteiro", Math.floor(Math.random() * (maximo.value - minimo.value + 1)) + minimo.value);
  },

  numero_linhas(matriz) {
    self.runtime.expectType("numero_linhas", "matriz", matriz, "matriz");

    return new PortugolVar("inteiro", matriz.value.length);
  },

  numero_colunas(matriz) {
    self.runtime.expectType("numero_colunas", "matriz", matriz, "matriz");

    return new PortugolVar("inteiro", matriz.value[0].value.length);
  },

  numero_elementos(vetor) {
    self.runtime.expectType("numero_elementos", "vetor", vetor, "vetor");

    return new PortugolVar("inteiro", vetor.value.length);
  },
}`;
