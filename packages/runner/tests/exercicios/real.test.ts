import { PortugolJsRuntime } from "@portugol-webstudio/runtime";
import { describe, expect, test } from "vitest";
import { realToString } from "../../src";

// O PortugolVar de verdade, do código que vai para o worker
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const loadPortugolVar = new Function(`${PortugolJsRuntime}\nreturn PortugolVar;`) as () => {
  realToString(value: number): string;
};
const PortugolVar = loadPortugolVar();

// Gerador com semente (Park-Miller): a varredura é a mesma a cada execução
function random(seed: number) {
  let state = seed;

  return () => {
    state = (state * 48_271) % 2_147_483_647;

    return state / 2_147_483_647;
  };
}

describe("realToString", () => {
  test.each([
    [0, "0.0"],
    [-0, "-0.0"],
    [8, "8.0"],
    [2.5, "2.5"],
    [-3.75, "-3.75"],
    [0.1 + 0.2, "0.30000000000000004"],
    [0.001, "0.001"],
    [0.0001, "1.0E-4"],
    [9_999_999.5, "9999999.5"],
    [10_000_000, "1.0E7"],
    [12_345_678.5, "1.23456785E7"],
    [1e20, "1.0E20"],
    [Number.MAX_VALUE, "1.7976931348623157E308"],
    [NaN, "NaN"],
    [Infinity, "Infinity"],
    [-Infinity, "-Infinity"],
  ])("%s → %s", (value, expected) => {
    expect(realToString(value)).toBe(expected);
    expect(PortugolVar.realToString(value)).toBe(expected);
  });

  test("dá o mesmo texto que o PortugolVar.realToString", () => {
    const next = random(2026);
    const differences: number[] = [];

    for (let index = 0; index < 20_000; index++) {
      // Magnitudes de 10^-20 a 10^20, com sinal, e o inteiro mais próximo de cada uma
      const value = (next() < 0.5 ? -1 : 1) * 10 ** (next() * 40 - 20);

      for (const candidate of [value, Math.round(value)]) {
        if (realToString(candidate) !== PortugolVar.realToString(candidate)) {
          differences.push(candidate);
        }
      }
    }

    expect(differences).toEqual([]);
  });
});
