import { PortugolCodeError } from "@portugol-webstudio/antlr";

import * as ec01 from "./01-estrutura-básica.js";
import * as ec02 from "./02-variáveis.js";
import { Arquivo } from "../nodes/index.js";

export default [
  ec01,
  ec02,
  // ec03,
  // ec04,
].flatMap(ec => Object.values(ec)) as Array<(arquivo: Arquivo) => Generator<PortugolCodeError, void, undefined>>;
