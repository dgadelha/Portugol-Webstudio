/**
 * Só o domínio de produção é a versão estável: o beta e o ambiente local se identificam como beta.
 */
export const IS_BETA = window.location.hostname !== "portugol.dev";
