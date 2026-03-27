import { PortugolCodeDiagnostic } from "@portugol-webstudio/antlr";

import { Arquivo } from "../nodes/index.js";
import * as ec01 from "./01-estrutura-básica.js";
import * as ec02 from "./02-variáveis.js";

export default [
  ec01,
  ec02,
  // ec03,
  // ec04,
].flatMap(ec => Object.values(ec)) as Array<(arquivo: Arquivo) => Generator<PortugolCodeDiagnostic, void, undefined>>;
