import { portugolRuntime } from "./PortugolRuntime";
import { portugolVar } from "./PortugolVar";

export const runtime = /* javascript */ `
//region Runtime
${portugolVar}
${portugolRuntime}
//endregion
`;
