import { portugolGraphicsContext } from "../graphics/PortugolGraphicsContext.js";
import { portugolObjetos } from "./PortugolObjetos.js";
import { portugolRuntime } from "./PortugolRuntime.js";
import { portugolVar } from "./PortugolVar.js";

export const runtime = /* javascript */ `
//region Runtime
${portugolVar}
${portugolObjetos}
${portugolGraphicsContext}
${portugolRuntime}
//endregion
`;
