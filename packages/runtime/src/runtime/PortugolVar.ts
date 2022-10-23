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

  toString() {
    switch (this.type) {
      case "caracter":
        return "'" + this.value + "'";

      case "cadeia":
        return '"' + this.value + '"';

      case "logico":
        return this.value ? "verdadeiro" : "falso";

      default:
        return this.value.toString();
    }
  }
}
`;
