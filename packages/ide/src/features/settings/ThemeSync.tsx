import { useLayoutEffect } from "react";

import { useResolvedTheme } from "./useSettings";

/**
 * Aplica o tema no `<html>`: a classe `dark` troca as cores (ver `globals.css`) e `data-theme` fica para o CSS legado.
 */
export function ThemeSync() {
  const theme = useResolvedTheme();

  useLayoutEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
  }, [theme]);

  return null;
}
