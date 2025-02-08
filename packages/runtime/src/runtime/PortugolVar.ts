export const portugolVar = /* javascript */ `
class PortugolVar {
  constructor(type, value, isReference = false, isConstant = false) {
    // this.name = name;
    this.type = type;
    this.value = value;
    this.isReference = isReference;
    this.isConstant = isConstant;
  }

  clone() {
    return new PortugolVar(this.type, this.value, this.isReference, this.isConstant);
  }

  stringValue() {
    switch (this.type) {
      case "logico":
        return this.value ? "verdadeiro" : "falso";

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

      case "logico":
        return this.value ? "verdadeiro" : "falso";

      default:
        return this.stringValue();
    }
  }
}
`;
