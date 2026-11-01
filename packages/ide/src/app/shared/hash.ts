/**
 * Um hash curto de um texto (cyrb53, em base 36): para saber se algo mudou, não para segurança.
 * Funciona fora de um contexto seguro, onde o `crypto.subtle` não existe.
 */
export function cyrb53(text: string) {
  let h1 = 0xde_ad_be_ef;
  let h2 = 0x41_c6_ce_57;

  for (let i = 0; i < text.length; i++) {
    const char = text.codePointAt(i)!;

    h1 = Math.imul(h1 ^ char, 2_654_435_761);
    h2 = Math.imul(h2 ^ char, 1_597_334_677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2_246_822_507) ^ Math.imul(h2 ^ (h2 >>> 13), 3_266_489_909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2_246_822_507) ^ Math.imul(h1 ^ (h1 >>> 13), 3_266_489_909);

  return (4_294_967_296 * (2_097_151 & h2) + (h1 >>> 0)).toString(36);
}
