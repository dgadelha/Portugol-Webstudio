// Só o que o editor usa: o resto é do próprio serviço.
export { type AjudaAssinatura, ajudaDeAssinatura } from "./assinatura.js";
export { completar, type ItemCompletar, type TipoItem } from "./completar.js";
export type { Intervalo, Posição } from "./contexto.js";
export { type Definição, definição } from "./definição.js";
export {
  chamadaDoValor,
  comValorAtual,
  informaçãoDoNome,
  type InformaçãoDoNome,
  type PontoDaPausa,
} from "./informação.js";
export { textoLiteral } from "./markdown.js";
