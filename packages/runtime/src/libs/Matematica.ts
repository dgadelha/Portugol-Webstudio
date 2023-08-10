export default /* javascript */ `{
  PI: new PortugolVar("real", Math.PI, false, true),
  E: new PortugolVar("real", Math.E, false, true),

  potencia(base, expoente) {
    self.runtime.expectType("potencia", "base", base, "inteiro", "real");
    self.runtime.expectType("potencia", "expoente", expoente, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(base, expoente), Math.pow(base.value, expoente.value));
  },

  raiz(radicando, indice) {
    self.runtime.expectType("raiz", "radicando", radicando, "inteiro", "real");
    self.runtime.expectType("raiz", "indice", indice, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(radicando, indice), Math.pow(radicando.value, 1 / indice.value));
  },

  log(numero) {
    self.runtime.expectType("log", "numero", numero, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(numero), Math.log(numero.value));
  },

  arredondar(numero, casas) {
    self.runtime.expectType("arredondar", "numero", numero, "inteiro", "real");
    self.runtime.expectType("arredondar", "casas", casas, "inteiro");

    return new PortugolVar(self.runtime.assumeMathType(numero, casas), Number(numero.value.toFixed(casas.value)));
  },

  valor_absoluto(numero) {
    self.runtime.expectType("valor_absoluto", "numero", numero, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(numero), Math.abs(numero.value));
  },

  seno(angulo) {
    self.runtime.expectType("seno", "angulo", angulo, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(angulo), Math.sin(angulo.value));
  },

  cosseno(angulo) {
    self.runtime.expectType("cosseno", "angulo", angulo, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(angulo), Math.cos(angulo.value));
  },

  tangente(angulo) {
    self.runtime.expectType("tangente", "angulo", angulo, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(angulo), Math.tan(angulo.value));
  },

  logaritmo(numero, base) {
    self.runtime.expectType("logaritmo", "numero", numero, "inteiro", "real");
    self.runtime.expectType("logaritmo", "base", base, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(numero, base), Math.log(numero.value) / Math.log(base.value));
  },

  maior_numero(numeroA, numeroB) {
    self.runtime.expectType("maior_numero", "numeroA", numeroA, "inteiro", "real");
    self.runtime.expectType("maior_numero", "numeroB", numeroB, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(numero), Math.max(numeroA.value, numeroB.value));
  },

  menor_numero(numeroA, numeroB) {
    self.runtime.expectType("menor_numero", "numeroA", numeroA, "inteiro", "real");
    self.runtime.expectType("menor_numero", "numeroB", numeroB, "inteiro", "real");

    return new PortugolVar(self.runtime.assumeMathType(numero), Math.min(numeroA.value, numeroB.value));
  },
}`;
