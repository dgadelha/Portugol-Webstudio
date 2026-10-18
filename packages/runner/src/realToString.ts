/**
 * Um `real` como o `escreva` o escreve: o formato do `Double.toString()` do Java, usado pelo
 * Portugol Studio. Para mostrar valores fora do programa (o esperado e o recebido da Correção
 * dos exercícios) do mesmo jeito que a saída.
 *
 * Cópia do `PortugolVar.realToString` do runtime, que vai para o worker como texto e não pode
 * ser importado. O teste `tests/exercicios/real.test.ts` confere que os dois dão o mesmo texto.
 */
export function realToString(value: number) {
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
    return `${sign}0.0`;
  }

  // toExponential() sem argumento gera a menor quantidade de dígitos que identifica o valor,
  // como o Double.toString()
  const [mantissa, exponent] = magnitude.toExponential().split("e", 2);
  const digits = mantissa.replace(".", "");
  const e = Number(exponent);

  // O Java só usa notação decimal quando 10^-3 <= |valor| < 10^7
  if (e < -3 || e >= 7) {
    return `${sign}${digits.charAt(0)}.${digits.slice(1) || "0"}E${e}`;
  }

  if (e < 0) {
    return `${sign}0.${"0".repeat(-e - 1)}${digits}`;
  }

  return `${sign}${digits.padEnd(e + 1, "0").slice(0, e + 1)}.${digits.slice(e + 1) || "0"}`;
}
