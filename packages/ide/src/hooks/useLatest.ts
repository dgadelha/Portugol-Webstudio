import { useLayoutEffect, useRef } from "react";

/**
 * Referência sempre atualizada para o valor mais recente. Útil para callbacks registrados uma
 * única vez (ações do Monaco, listeners) que precisam enxergar o estado atual.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);

  useLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
