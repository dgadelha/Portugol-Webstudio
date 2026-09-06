import { describe, expect, test } from "vitest";

import { portugol } from "../helpers/code";
import { runPortugolCode } from "../helpers/runner";

describe("Biblioteca: Matematica", () => {
  describe("Constantes", () => {
    test("PI", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.PI)
							}
						}
					`,
        ),
      ).resolves.toBe(Math.PI.toString());
    });
  });

  describe("Funções", () => {
    test("potencia", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.potencia(2.0, 3.0))
							}
						}
					`,
        ),
      ).resolves.toBe("8.0");
    });

    test("raiz", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.raiz(16.0, 2.0))
							}
						}
					`,
        ),
      ).resolves.toBe("4.0");
    });

    test("arredondar", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.arredondar(3.14159, 2))
							}
						}
					`,
        ),
      ).resolves.toBe("3.14");
    });

    test("logaritmo", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.logaritmo(8.0, 2.0))
							}
						}
					`,
        ),
      ).resolves.toBe("3.0");
    });

    test("seno", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.seno(0.0))
							}
						}
					`,
        ),
      ).resolves.toBe("0.0");
    });

    test("cosseno", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.cosseno(0.0))
							}
						}
					`,
        ),
      ).resolves.toBe("1.0");
    });

    test("tangente", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.tangente(0.0))
							}
						}
					`,
        ),
      ).resolves.toBe("0.0");
    });

    test("valor_absoluto", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.valor_absoluto(-42.5))
							}
						}
					`,
        ),
      ).resolves.toBe("42.5");
    });

    test("maior_numero", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.maior_numero(10.5, 7.25))
							}
						}
					`,
        ),
      ).resolves.toBe("10.5");
    });

    test("menor_numero", async () => {
      await expect(
        runPortugolCode(
          portugol`
						programa {
							inclua biblioteca Matematica

							funcao inicio() {
								escreva(Matematica.menor_numero(10.5, 7.25))
							}
						}
					`,
        ),
      ).resolves.toBe("7.25");
    });
  });

  describe("Tipo de retorno", () => {
    test("Todas as funções devolvem real", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(
                  Matematica.potencia(2, 3), "|",
                  Matematica.raiz(16, 2), "|",
                  Matematica.valor_absoluto(5), "|",
                  Matematica.maior_numero(3, 7), "|",
                  Matematica.menor_numero(3, 7)
                )
              }
            }
          `,
        ),
      ).resolves.toBe("8.0|4.0|5.0|7.0|3.0");
    });

    test("Arredondar devolve real mesmo sem casas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.arredondar(3.7, 0), "|", Matematica.arredondar(4, 0))
              }
            }
          `,
        ),
      ).resolves.toBe("4.0|4.0");
    });
  });

  describe("potencia e raiz", () => {
    test("Eleva a expoentes variados", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.potencia(2.0, 0.5), "|", Matematica.potencia(2.0, -1.0), "|", Matematica.potencia(0.0, 0.0), "|", Matematica.potencia(2.0, 10.0))
              }
            }
          `,
        ),
      ).resolves.toBe("1.4142135623730951|0.5|1.0|1024.0");
    });

    test("Extrai raízes de índices variados", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.raiz(27.0, 3.0), "|", Matematica.raiz(-8.0, 3.0), "|", Matematica.raiz(2.0, 2.0))
              }
            }
          `,
        ),
      ).resolves.toBe("3.0|NaN|1.4142135623730951");
    });
  });

  describe("arredondar", () => {
    test("Arredonda meio para cima", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.arredondar(0.5, 0), "|", Matematica.arredondar(1.5, 0), "|", Matematica.arredondar(2.5, 0))
              }
            }
          `,
        ),
      ).resolves.toBe("1.0|2.0|3.0");
    });

    test("Arredonda negativos meio para cima", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.arredondar(-0.5, 0), "|", Matematica.arredondar(-1.5, 0), "|", Matematica.arredondar(-2.5, 0))
              }
            }
          `,
        ),
      ).resolves.toBe("0.0|-1.0|-2.0");
    });

    test("Respeita o número de casas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.arredondar(1.23456789, 0), "|", Matematica.arredondar(1.23456789, 1), "|", Matematica.arredondar(1.23456789, 5), "|", Matematica.arredondar(1.23456789, 15))
              }
            }
          `,
        ),
      ).resolves.toBe("1.0|1.2|1.23457|1.23456789");
    });

    test("Trata casas negativas como zero casas", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.arredondar(1234.5678, -1), "|", Matematica.arredondar(1234.5678, -3))
              }
            }
          `,
        ),
      ).resolves.toBe("1235.0|1235.0");
    });

    test("Arredonda valores com representação inexata", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.arredondar(2.675, 2), "|", Matematica.arredondar(1.005, 2), "|", Matematica.arredondar(0.1 + 0.2, 2))
              }
            }
          `,
        ),
      ).resolves.toBe("2.68|1.0|0.3");
    });
  });

  describe("logaritmo", () => {
    test("Calcula logaritmos em bases diferentes", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.logaritmo(8.0, 2.0), "|", Matematica.logaritmo(100.0, 10.0), "|", Matematica.logaritmo(1.0, 10.0))
              }
            }
          `,
        ),
      ).resolves.toBe("3.0|2.0|0.0");
    });

    test("Devolve infinito e indeterminação nos extremos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.logaritmo(0.0, 10.0), "|", Matematica.logaritmo(-1.0, 10.0))
              }
            }
          `,
        ),
      ).resolves.toBe("-Infinity|NaN");
    });
  });

  describe("Trigonometria", () => {
    test("Calcula nos ângulos notáveis", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.seno(0.0), "|", Matematica.cosseno(0.0), "|", Matematica.tangente(0.0))
              }
            }
          `,
        ),
      ).resolves.toBe("0.0|1.0|0.0");
    });

    test("Reflete a imprecisão do ponto flutuante", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.seno(Matematica.PI), "|", Matematica.tangente(Matematica.PI / 2.0))
              }
            }
          `,
        ),
      ).resolves.toBe("1.2246467991473532E-16|1.633123935319537E16");
    });
  });

  describe("valor_absoluto, maior_numero e menor_numero", () => {
    test("Calcula o módulo", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.valor_absoluto(-5.0), "|", Matematica.valor_absoluto(5.0), "|", Matematica.valor_absoluto(0.0))
              }
            }
          `,
        ),
      ).resolves.toBe("5.0|5.0|0.0");
    });

    test("Compara valores iguais e mistos", async () => {
      await expect(
        runPortugolCode(
          portugol`
            programa {
              inclua biblioteca Matematica

              funcao inicio() {
                escreva(Matematica.maior_numero(3, 7.5), "|", Matematica.menor_numero(3.5, 7), "|", Matematica.maior_numero(2, 2))
              }
            }
          `,
        ),
      ).resolves.toBe("7.5|3.5|2.0");
    });
  });
});
