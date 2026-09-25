import { useSyncExternalStore } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";

import { settingsStore } from "./settingsStore";

export function useSettings() {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.getSnapshot);
}

export type ResolvedTheme = "light" | "dark";

/**
 * O tema efetivo: a preferência do usuário, ou a do sistema quando está em "Automático".
 */
export function useResolvedTheme(): ResolvedTheme {
  const { theme } = useSettings();
  const systemPrefersLight = useMediaQuery("(prefers-color-scheme: light)");

  if (theme === "auto") {
    return systemPrefersLight ? "light" : "dark";
  }

  return theme;
}

/**
 * Nome do tema do Monaco correspondente ao tema da interface.
 */
export function useMonacoTheme() {
  return `portugol-${useResolvedTheme()}`;
}
