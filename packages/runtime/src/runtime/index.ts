import { portugolGraphicsContext } from "../graphics/PortugolGraphicsContext.js";
import { portugolRuntime } from "./PortugolRuntime.js";
import { portugolVar } from "./PortugolVar.js";

export const runtime = /* javascript */ `
//region Runtime
${portugolVar}
${portugolGraphicsContext}
${portugolRuntime}
//endregion
`;
