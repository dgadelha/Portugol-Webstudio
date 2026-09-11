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

export function blocoVálido(bloco: Comando | Expressão): boolean {
  return PERMITIDOS.some(classe => bloco instanceof classe);
}
