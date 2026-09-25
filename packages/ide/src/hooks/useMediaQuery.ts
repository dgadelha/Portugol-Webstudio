import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    onChange => {
      const media = window.matchMedia(query);

      media.addEventListener("change", onChange);

      return () => {
        media.removeEventListener("change", onChange);
      };
    },
    () => window.matchMedia(query).matches,
  );
}

/**
 * Abaixo do breakpoint `md` (768px) os painéis lado a lado passam a ficar empilhados.
 */
export function useIsBelowMd() {
  return useMediaQuery("(max-width: 767px)");
}
