import {
  type Construtor,
  DivisãoExpr,
  type Expressão,
  ExpressãoEntreParênteses,
  ExpressãoMatemática,
  InteiroExpr,
  MaisUnárioExpr,
  MenosUnárioExpr,
  MultiplicaçãoExpr,
  MóduloExpr,
  NegaçãoBitwiseExpr,
  type Node,
  OperaçãoAndBitwiseExpr,
  OperaçãoOrBitwiseExpr,
  OperaçãoShiftLeftExpr,
  OperaçãoShiftRightExpr,
  OperaçãoXorExpr,
  ReferênciaVarExpr,
  SomaExpr,
  SubtraçãoExpr,
} from "../nodes/index.js";

/**
 * `nãoConstante` vira erro citando o nome; `indeterminado` é constante cujo valor não
 * soubemos calcular, e não gera diagnóstico.
 */
export type ConstanteDeTamanho =
  { situação: "indeterminado" } | { situação: "nãoConstante"; nome: string } | { situação: "valor"; valor: number };

export type ResolverConstanteDeTamanho = (nó: ReferênciaVarExpr) => ConstanteDeTamanho;

export type ResultadoTamanho =
  /**
   * Nada deve ser reportado: ou algum erro já saiu, ou o Portugol Studio estoura no caso.
   */
  | { situação: "indeterminado" }
  | { situação: "inválido"; nó: Node; variável?: string }
  | { situação: "valor"; valor: number };

const INDETERMINADO: ResultadoTamanho = { situação: "indeterminado" };

/**
 * Porta de `analise/semantica/AnalisadorDeclaracaoTamanhoVetorMatriz.java` (mais o trecho
 * de `obterTamanhoVetorMatriz` que trata literal e constante).
 *
 * **Divergência intencional:** o Java calcula subtração e divisão com os operandos trocados
 * (`direito - esquerdo`), recusando `inteiro v[5-2]` e aceitando `inteiro v[2-5]`. Aqui a
 * aritmética é a correta, então aceitamos mais programas que o Portugol Studio.
 */
export function avaliarTamanho(expressão: Expressão, resolver: ResolverConstanteDeTamanho): ResultadoTamanho {
  if (expressão instanceof ExpressãoEntreParênteses) {
    // O Portugol Studio não tem nó de parênteses: `v[(3)]` é igual a `v[3]`.
    return avaliarTamanho(expressão.expressão, resolver);
  }

  if (expressão instanceof MaisUnárioExpr) {
    return avaliarTamanho(expressão.valor, resolver);
  }

  if (expressão instanceof InteiroExpr) {
    return { situação: "valor", valor: expressão.valor };
  }

  if (expressão instanceof ReferênciaVarExpr) {
    const constante = resolver(expressão);

    switch (constante.situação) {
      case "valor": {
        return { situação: "valor", valor: constante.valor };
      }

      case "nãoConstante": {
        return { situação: "inválido", nó: expressão, variável: constante.nome };
      }

      default: {
        return INDETERMINADO;
      }
    }
  }

  if (expressão instanceof MenosUnárioExpr) {
    return aplicarUnário(avaliarTamanho(expressão.valor, resolver), valor => -valor);
  }

  if (expressão instanceof NegaçãoBitwiseExpr) {
    return aplicarUnário(avaliarTamanho(expressão.expressão, resolver), valor => ~valor);
  }

  if (!(expressão instanceof ExpressãoMatemática)) {
    return { situação: "inválido", nó: expressão };
  }

  const operação = OPERAÇÃO.get(expressão.constructor as Construtor);

  if (!operação) {
    return { situação: "inválido", nó: expressão };
  }

  return aplicarBinário(
    avaliarTamanho(expressão.esquerda, resolver),
    avaliarTamanho(expressão.direita, resolver),
    operação,
  );
}

function aplicarUnário(operando: ResultadoTamanho, operação: (valor: number) => number): ResultadoTamanho {
  return operando.situação === "valor" ? { situação: "valor", valor: operação(operando.valor) } : operando;
}

function aplicarBinário(
  esquerda: ResultadoTamanho,
  direita: ResultadoTamanho,
  operação: (esquerda: number, direita: number) => number,
): ResultadoTamanho {
  if (esquerda.situação !== "valor") {
    return esquerda;
  }

  if (direita.situação !== "valor") {
    return direita;
  }

  const valor = operação(esquerda.valor, direita.valor);

  // Divisão e módulo por zero: o Java estoura `ArithmeticException` e derruba a análise
  // inteira. Aqui só desistimos de calcular.
  return Number.isFinite(valor) ? { situação: "valor", valor: Math.trunc(valor) } : INDETERMINADO;
}

const OPERAÇÃO = new Map<Construtor, (esquerda: number, direita: number) => number>([
  [SomaExpr, (a, b) => a + b],
  [SubtraçãoExpr, (a, b) => a - b],
  [MultiplicaçãoExpr, (a, b) => a * b],
  [DivisãoExpr, (a, b) => (b === 0 ? NaN : a / b)],
  [MóduloExpr, (a, b) => (b === 0 ? NaN : a % b)],
  [OperaçãoShiftLeftExpr, (a, b) => a << b],
  [OperaçãoShiftRightExpr, (a, b) => a >> b],
  [OperaçãoAndBitwiseExpr, (a, b) => a & b],
  [OperaçãoOrBitwiseExpr, (a, b) => a | b],
  [OperaçãoXorExpr, (a, b) => a ^ b],
]);
