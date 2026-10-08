import {
  AtribuiçãoCmd,
  CasoCmd,
  ChamadaFunçãoExpr,
  Comando,
  type Construtor,
  DeclaraçãoCmd,
  EnquantoCmd,
  EscolhaCmd,
  Expressão,
  ExpressãoEntreParênteses,
  ExpressãoUnária,
  FaçaEnquantoCmd,
  ParaCmd,
  PareCmd,
  RetorneCmd,
  SeCmd,
} from "../nodes/index.js";

/**
 * Porta de `blocoValido` do `AnalisadorSemantico`. Duas diferenças de forma, sem diferença
 * de comportamento: `x++` / `--x` valem porque o Portugol Studio os transforma em
 * atribuição no sintático (aqui continuam `ExpressãoUnária`); e `NoTitulo`/`NoVaPara` não
 * existem na nossa gramática, o que elimina a verificação `ErroComandoNaoSuportado` (#54)
 * — `continue`, `titulo` e `vaPara` não passam pelo léxico, e `senao` só é alcançável
 * dentro de um `se`.
 */
const PERMITIDOS: readonly Construtor[] = [
  AtribuiçãoCmd,
  CasoCmd,
  ChamadaFunçãoExpr,
  DeclaraçãoCmd,
  EnquantoCmd,
  EscolhaCmd,
  ExpressãoUnária,
  FaçaEnquantoCmd,
  ParaCmd,
  PareCmd,
  RetorneCmd,
  SeCmd,
];

/**
 * A árvore do Portugol Studio não tem nó de parênteses: `(x(2))` é só a chamada, e vale como
 * comando. Na nossa, os parênteses viram um nó que escondia o que está dentro.
 */
export function semParênteses<T extends Comando | Expressão>(bloco: T): T | Expressão {
  let interno: T | Expressão = bloco;

  while (interno instanceof ExpressãoEntreParênteses) {
    interno = interno.expressão;
  }

  return interno;
}

export function blocoVálido(bloco: Comando | Expressão): boolean {
  const interno = semParênteses(bloco);

  return PERMITIDOS.some(classe => interno instanceof classe);
}
