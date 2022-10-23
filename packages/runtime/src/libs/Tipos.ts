const PADRAO_INTEIRO_NOTACAO_HEXADECIMAL = /^(0x|0X)?([0-9]|[a-f]|[A-F])+$/;
const PADRAO_INTEIRO_NOTACAO_BINARIA = /^(0b|0B)?[0-1]+$/;
const PADRAO_INTEIRO_NOTACAO_DECIMAL = /^-?\d+$/;
const PADRAO_REAL = /^-?\d+\.\d+$/;
const PADRAO_LOGICO = /^verdadeiro|falso$/i;

export default /* javascript */ `{
  cadeia_e_inteiro(cad, base) {
    self.runtime.expectType("cadeia_e_inteiro", "cad", cad, "cadeia", "caracter");
    self.runtime.expectType("cadeia_e_inteiro", "base", base, "inteiro");

    switch (base.value) {
      case 2: return new PortugolVar("logico", ${PADRAO_INTEIRO_NOTACAO_BINARIA}.test(cad.value));
      case 10: return new PortugolVar("logico", ${PADRAO_INTEIRO_NOTACAO_DECIMAL}.test(cad.value));
      case 16: return new PortugolVar("logico", ${PADRAO_INTEIRO_NOTACAO_HEXADECIMAL}.test(cad.value));
    }

    throw new Error("A base informada (" + base.value + ") é inválida, a base deve ser um dos seguintes valores: 2; 10; 16");
  },

  cadeia_e_real(cad) {
    self.runtime.expectType("cadeia_e_real", "cad", cad, "cadeia", "caracter");

    return new PortugolVar("logico", ${PADRAO_REAL}.test(cad.value));
  },

  cadeia_e_logico(cad) {
    self.runtime.expectType("cadeia_e_logico", "cad", cad, "cadeia", "caracter");

    return new PortugolVar("logico", ${PADRAO_LOGICO}.test(cad.value));
  },

  cadeia_e_caracter(cad) {
    self.runtime.expectType("cadeia_e_caracter", "cad", cad, "cadeia", "caracter");

    return new PortugolVar("logico", cad.value.length === 1);
  },

  cadeia_para_caracter(valor) {
    self.runtime.expectType("cadeia_para_caracter", "valor", valor, "cadeia", "caracter");

    if (valor.value.length === 1) {
      return new PortugolVar("caracter", valor.value.charAt(0));
    }

    throw new Error("o valor '" + valor.value + "' não é um caracter válido");
  },

  cadeia_para_inteiro(valor, base) {
    self.runtime.expectType("cadeia_para_inteiro", "valor", valor, "cadeia", "caracter");
    self.runtime.expectType("cadeia_para_inteiro", "base", base, "inteiro");

    if (base.value === 2 || base.value === 10 || base.value === 16) {
      switch (base.value) {
        case 16:
          valor.value = valor.value.replace(/^0x/i, "");
          break;

        case 2:
          valor.value = valor.value.replace(/^0b/i, "");
          break;
      }

      const inteiro = parseInt(valor.value, base.value);

      if (isNaN(inteiro)) {
        throw new Error("o valor '" + valor.value + "' não é um número inteiro válido");
      }

      return new PortugolVar("inteiro", inteiro);
    }

    throw new Error("A base informada (" + base.value + ") é inválida, a base deve ser um dos seguintes valores: 2; 10; 16");
  },

  cadeia_para_real(valor) {
    self.runtime.expectType("cadeia_para_real", "valor", valor, "cadeia", "caracter");

    const real = parseFloat(valor.value);

    if (isNaN(real)) {
      throw new Error("o valor '" + valor.value + "' não é um número real válido");
    }

    return new PortugolVar("real", real);
  },

  cadeia_para_logico(valor) {
    self.runtime.expectType("cadeia_para_logico", "valor", valor, "cadeia", "caracter");

    switch (valor.value) {
      case "verdadeiro": return new PortugolVar("logico", true);
      case "falso": return new PortugolVar("logico", false);
    }

    throw new Error("o valor '" + valor.value + "' não é um valor lógico válido");
  },

  inteiro_e_caracter(_int) {
    self.runtime.expectType("inteiro_e_caracter", "_int", _int, "inteiro");

    return new PortugolVar("logico", _int.value >= 0 && _int.value <= 9);
  },

  inteiro_para_cadeia(valor, base) {
    self.runtime.expectType("inteiro_para_cadeia", "valor", valor, "inteiro");
    self.runtime.expectType("inteiro_para_cadeia", "base", base, "inteiro");

    if (isNaN(valor.value) || isNaN(valor.value >>> 0)) {
      throw new Error("o valor '" + valor.value + "' não é um número inteiro válido");
    }

    switch (base.value) {
      case 2: return new PortugolVar("cadeia", (valor.value >>> 0).toString(2).padStart(32, "0"));
      case 10: return new PortugolVar("cadeia", valor.value.toString());
      case 16: return new PortugolVar("cadeia", "0x" + (valor.value >>> 0).toString(16).toUpperCase().padStart(8, "0"));
    }

    throw new Error("A base informada (" + base.value + ") é inválida, a base deve ser um dos seguintes valores: 2; 10; 16");
  },

  inteiro_para_caracter(valor) {
    self.runtime.expectType("inteiro_para_caracter", "valor", valor, "inteiro");

    if (valor.value >= 0 && valor.value <= 9) {
      return new PortugolVar("caracter", valor.value.toString());
    }

    throw new Error("o valor '" + valor.value + "' não é um caracter válido");
  },

  inteiro_para_logico(valor) {
    self.runtime.expectType("inteiro_para_logico", "valor", valor, "inteiro");

    if (valor.value <= 0) {
      return new PortugolVar("logico", false);
    }

    return new PortugolVar("logico", true);
  },

  inteiro_para_real(valor) {
    self.runtime.expectType("inteiro_para_real", "valor", valor, "inteiro");

    return new PortugolVar("real", valor.value);
  },

  caracter_e_inteiro(car) {
    self.runtime.expectType("caracter_e_inteiro", "car", car, "caracter");

    return new PortugolVar("logico", ${PADRAO_INTEIRO_NOTACAO_HEXADECIMAL}.test(car.value));
  },

  caracter_e_logico(car) {
    self.runtime.expectType("caracter_e_logico", "car", car, "caracter");

    return new PortugolVar("logico", ["S", "s", "N", "n"].includes(car.value));
  },

  caracter_para_cadeia(valor) {
    self.runtime.expectType("caracter_para_cadeia", "valor", valor, "caracter");

    return new PortugolVar("cadeia", valor.value);
  },

  caracter_para_inteiro(valor) {
    self.runtime.expectType("caracter_para_inteiro", "valor", valor, "caracter");

    const num = parseInt(valor.value, 10);

    if (isNaN(num)) {
      throw new Error("o valor '" + valor.value + "' não é um número inteiro válido");
    }

    return new PortugolVar("inteiro", num);
  },

  caracter_para_logico(valor) {
    self.runtime.expectType("caracter_para_logico", "valor", valor, "caracter");

    switch (valor.value) {
      case "S": case "s": return new PortugolVar("logico", true);
      case "N": case "n": return new PortugolVar("logico", false);
    }

    throw new Error("o valor '" + valor.value + "' não é um valor lógico válido");
  },

  logico_para_cadeia(valor) {
    self.runtime.expectType("logico_para_cadeia", "valor", valor, "logico");

    return new PortugolVar("cadeia", valor.value ? "verdadeiro" : "falso");
  },

  logico_para_inteiro(valor) {
    self.runtime.expectType("logico_para_inteiro", "valor", valor, "logico");

    return new PortugolVar("inteiro", valor.value ? 1 : 0);
  },

  logico_para_caracter(valor) {
    self.runtime.expectType("logico_para_caracter", "valor", valor, "logico");

    return new PortugolVar("caracter", valor.value ? "S" : "N");
  },

  real_para_cadeia(valor) {
    self.runtime.expectType("real_para_cadeia", "valor", valor, "real");

    return new PortugolVar("cadeia", valor.value.toString());
  },

  real_para_inteiro(valor) {
    self.runtime.expectType("real_para_inteiro", "valor", valor, "real");

    return new PortugolVar("inteiro", Math.trunc(valor.value));
  },
}`;
