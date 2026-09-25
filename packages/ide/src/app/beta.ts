import { isDevMode } from "@angular/core";

/**
 * Só o domínio de produção é a versão estável: o beta e o ambiente local se identificam como beta.
 */
export const IS_BETA = window.location.hostname !== "portugol.dev";

/**
 * Canal enviado ao Google Analytics em todos os eventos, para separar o tráfego
 * de produção do beta e do desenvolvimento local.
 */
export const RELEASE_CHANNEL = isDevMode() ? "local" : IS_BETA ? "beta" : "stable";
