/**
 * Os limites do formato dos exercícios, sem o zod: o esquema (`esquema.js`) e o IDE leem daqui.
 */

/**
 * O tamanho máximo do enunciado, em caracteres. O maior dos exercícios que vêm com o IDE tem
 * menos de mil; o limite deixa folga e protege quem abre um exercício compartilhado de um texto
 * enorme, que o Markdown levaria muito tempo para mostrar.
 */
export const TAMANHO_MAXIMO_DO_ENUNCIADO = 10_000;
