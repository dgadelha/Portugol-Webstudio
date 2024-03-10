import {
  DecrementoUnarioPosfixadoContext,
  IncrementoUnarioPosfixadoContext,
  IncrementoUnarioPrefixadoContext,
  ReferenciaParaVariavelContext,
} from "@portugol-webstudio/antlr";

import { Expressão } from "./Expressão.js";
import { ReferênciaVarExpr } from "./ReferênciaVarExpr.js";

export class ExpressãoUnária<
  T extends DecrementoUnarioPosfixadoContext | IncrementoUnarioPrefixadoContext | IncrementoUnarioPosfixadoContext,
> extends Expressão<T> {
  variável = new ReferênciaVarExpr(this.ctx as unknown as ReferenciaParaVariavelContext);
}
