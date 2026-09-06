export default /* javascript */ `{
  PI: new PortugolVar("real", Math.PI, true),

  potencia(base, expoente) {
    self.runtime.expectType("potencia", "base", base, "inteiro", "real");
    self.runtime.expectType("potencia", "expoente", expoente, "inteiro", "real");

    return new PortugolVar("real", Math.pow(base.value, expoente.value));
  },

  raiz(radicando, indice) {
    self.runtime.expectType("raiz", "radicando", radicando, "inteiro", "real");
    self.runtime.expectType("raiz", "indice", indice, "inteiro", "real");

    return new PortugolVar("real", Math.pow(radicando.value, 1 / indice.value));
  },

  arredondar(numero, casas) {
    self.runtime.expectType("arredondar", "numero", numero, "inteiro", "real");
    self.runtime.expectType("arredondar", "casas", casas, "inteiro");

    let factor = 1;

    for (let i = 1; i <= casas.value; i++) {
      factor *= 10;
    }

    // O Math.round() do Java devolve um long: o NaN vira 0, o resultado satura
    // nos limites de 64 bits e, por ser inteiro, nunca é -0.0
    const raw = Math.round(numero.value * factor);
    const rounded = isNaN(raw) ? 0 : Math.min(Math.max(raw, -9223372036854775808), 9223372036854775807);

    return new PortugolVar("real", (rounded === 0 ? 0 : rounded) / factor);
  },

  valor_absoluto(numero) {
    self.runtime.expectType("valor_absoluto", "numero", numero, "inteiro", "real");

    return new PortugolVar("real", Math.abs(numero.value));
  },

  seno(angulo) {
    self.runtime.expectType("seno", "angulo", angulo, "inteiro", "real");

    return new PortugolVar("real", Math.sin(angulo.value));
  },

  cosseno(angulo) {
    self.runtime.expectType("cosseno", "angulo", angulo, "inteiro", "real");

    return new PortugolVar("real", Math.cos(angulo.value));
  },

  tangente(angulo) {
    self.runtime.expectType("tangente", "angulo", angulo, "inteiro", "real");

    return new PortugolVar("real", Math.tan(angulo.value));
  },

  logaritmo(numero, base) {
    self.runtime.expectType("logaritmo", "numero", numero, "inteiro", "real");
    self.runtime.expectType("logaritmo", "base", base, "inteiro", "real");

    return new PortugolVar("real", Math.log(numero.value) / Math.log(base.value));
  },

  maior_numero(numeroA, numeroB) {
    self.runtime.expectType("maior_numero", "numeroA", numeroA, "inteiro", "real");
    self.runtime.expectType("maior_numero", "numeroB", numeroB, "inteiro", "real");

    return new PortugolVar("real", Math.max(numeroA.value, numeroB.value));
  },

  menor_numero(numeroA, numeroB) {
    self.runtime.expectType("menor_numero", "numeroA", numeroA, "inteiro", "real");
    self.runtime.expectType("menor_numero", "numeroB", numeroB, "inteiro", "real");

    return new PortugolVar("real", Math.min(numeroA.value, numeroB.value));
  },
}`;
