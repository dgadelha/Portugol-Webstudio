export const portugolVar = /* javascript */ `
class PortugolVar {
  static INTEGER_PATTERNS = {
    2: /^[+-]?[01]+$/,
    10: /^[+-]?[0-9]+$/,
    16: /^[+-]?[0-9a-f]+$/i,
  };

  static INTEGER_PREFIXES = { 2: "0b", 10: "", 16: "0x" };

  static REAL_WHITESPACE = /^[\\u0000-\\u0020]+|[\\u0000-\\u0020]+$/g;

  static REAL_PATTERN = /^([+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:[eE][+-]?\\d+)?)[fFdD]?$|^([+-]?(?:Infinity|NaN))$/;

  constructor(type, value, isConstant = false) {
    // this.name = name;
    this.type = type;
    this.value = value;
    this.isConstant = isConstant;
  }

  clone() {
    let value = this.value;

    if (Array.isArray(value)) {
      value = value.map((v) => {
        if (v instanceof PortugolVar) {
          return v.clone();
        }

        return v;
      });
    }

    return new PortugolVar(this.type, value, this.isConstant);
  }

  // Valor inicial de cada tipo, como na inicialização de arrays do Java: o
  // 'caracter' começa com o caractere nulo e a 'cadeia', sendo um String[],
  // começa nula — daí o "null" ao concatenar um elemento nunca escrito.
  static defaultFor(type) {
    switch (type) {
      case "inteiro":
      case "real":
        return new PortugolVar(type, 0);

      case "logico":
        return new PortugolVar(type, false);

      case "caracter":
        // Sem escape porque este arquivo é um template literal: uma barra
        // invertida aqui teria que ser duplicada para sobreviver até o worker
        return new PortugolVar(type, String.fromCodePoint(0));

      case "cadeia":
        return new PortugolVar(type, null);

      default:
        return new PortugolVar(type, undefined);
    }
  }

  // Reproduz o Integer.toBinaryString()/toHexString()/toString() do Java. As bases
  // 2 e 16 usam a representação sem sinal de 32 bits, preenchida com zeros à esquerda.
  static intToString(value, base) {
    switch (base) {
      case 2:
        return (value >>> 0).toString(2).padStart(32, "0");

      case 16:
        return (value >>> 0).toString(16).toUpperCase().padStart(8, "0");

      default:
        return String(value);
    }
  }

  // Reproduz o Long.parseLong(texto, base) do Java seguido da conversão para int
  // feita pela biblioteca Tipos. Retorna null quando o texto não é um número válido.
  static parseInteger(text, base) {
    const pattern = PortugolVar.INTEGER_PATTERNS[base];

    if (!pattern || !pattern.test(text)) {
      return null;
    }

    const negative = text.charAt(0) === "-";
    const digits = text.charAt(0) === "+" || negative ? text.slice(1) : text;

    let value = BigInt(PortugolVar.INTEGER_PREFIXES[base] + digits);

    if (negative) {
      value = -value;
    }

    // O Long.parseLong() rejeita valores fora da faixa de 64 bits
    if (value > 9223372036854775807n || value < -9223372036854775808n) {
      return null;
    }

    // A biblioteca Tipos converte a faixa [2^31, 2^32) para negativos antes do
    // intValue(), que por sua vez trunca o valor para 32 bits
    if (value >= 2147483648n) {
      value -= 4294967296n;
    }

    return Number(BigInt.asIntN(32, value));
  }

  // Reproduz o Integer.parseInt() do Java, usado pelo 'leia'. Diferente do
  // Long.parseLong() de parseInteger(), ele recusa valores fora de 32 bits.
  static parseInteger32(text) {
    if (!PortugolVar.INTEGER_PATTERNS[10].test(text)) {
      return null;
    }

    const value = Number(text);

    if (value < -2147483648 || value > 2147483647) {
      return null;
    }

    // O Number() preserva o zero negativo de "-0", o Integer.parseInt() não
    return value === 0 ? 0 : value;
  }

  // Reproduz o Double.parseDouble() do Java. Retorna null quando o texto não é
  // um número válido. A notação hexadecimal de ponto flutuante não é suportada.
  static parseReal(text) {
    // O Java descarta os caracteres de controle e o espaço nas pontas
    const value = text.replace(PortugolVar.REAL_WHITESPACE, "");
    const match = PortugolVar.REAL_PATTERN.exec(value);

    if (!match) {
      return null;
    }

    return Number(match[1] ?? match[2]);
  }

  // Reproduz a conversão (int) de um double no Java, que satura nos limites do
  // inteiro de 32 bits e trunca a parte fracionária em direção ao zero.
  static realToInt(value) {
    if (Number.isNaN(value)) {
      return 0;
    }

    const truncated = Math.min(Math.max(Math.trunc(value), -2147483648), 2147483647);

    // O Math.trunc() devolve -0 entre -1 e 0, mas o (int) do Java devolve 0
    return truncated === 0 ? 0 : truncated;
  }

  // Reproduz o formato do Double.toString() do Java, usado pelo Portugol Studio
  // para converter valores do tipo 'real' em texto.
  static realToString(value) {
    if (typeof value !== "number") {
      return String(value);
    }

    if (Number.isNaN(value)) {
      return "NaN";
    }

    if (value === Infinity) {
      return "Infinity";
    }

    if (value === -Infinity) {
      return "-Infinity";
    }

    const sign = value < 0 || Object.is(value, -0) ? "-" : "";
    const magnitude = Math.abs(value);

    if (magnitude === 0) {
      return sign + "0.0";
    }

    // toExponential() sem argumento gera a menor quantidade de dígitos que
    // identifica o valor, exatamente como o algoritmo do Double.toString().
    const [mantissa, exponent] = magnitude.toExponential().split("e");
    const digits = mantissa.replace(".", "");
    const e = Number(exponent);

    // O Java só usa notação decimal quando 10^-3 <= |valor| < 10^7
    if (e < -3 || e >= 7) {
      return sign + digits.charAt(0) + "." + (digits.slice(1) || "0") + "E" + e;
    }

    if (e < 0) {
      return sign + "0." + "0".repeat(-e - 1) + digits;
    }

    return sign + digits.padEnd(e + 1, "0").slice(0, e + 1) + "." + (digits.slice(e + 1) || "0");
  }

  stringValue() {
    switch (this.type) {
      case "logico":
        return this.value ? "verdadeiro" : "falso";

      case "real":
        return PortugolVar.realToString(this.value);

      default:
        // O 'escreva' do Portugol Studio imprime uma cadeia nula como vazia
        return this.value === null ? "" : String(this.value);
    }
  }

  // A concatenação com '+' vira concatenação de String do Java, que imprime
  // 'true'/'false' em vez do 'verdadeiro'/'falso' do 'escreva'
  concatValue() {
    switch (this.type) {
      case "logico":
        return this.value ? "true" : "false";

      case "real":
        return PortugolVar.realToString(this.value);

      default:
        return String(this.value);
    }
  }

  getValue() {
    if (Array.isArray(this.value)) {
      const handleValue = (value) => {
        if (value instanceof PortugolVar) {
          return value.value;
        }

        return value;
      };

      return this.value.map(handleValue);
    }

    return this.value;
  }

  toString() {
    switch (this.type) {
      case "caracter":
        return "'" + this.stringValue() + "'";

      case "cadeia":
        return '"' + this.stringValue() + '"';

      default:
        return this.stringValue();
    }
  }
}
`;
