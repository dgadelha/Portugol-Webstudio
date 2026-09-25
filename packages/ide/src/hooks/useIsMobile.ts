import { useMediaQuery } from "./useMediaQuery";

/**
 * Usado pela sidebar: abaixo de 768px ela vira uma gaveta.
 */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}
