import { createContext, useContext } from "react";

export interface AppDialogs {
  openSettings: () => void;
  openAbout: () => void;
  openExamples: () => void;
  openCommandPalette: () => void;
}

export const AppDialogsContext = createContext<AppDialogs | null>(null);

export function useAppDialogs() {
  const dialogs = useContext(AppDialogsContext);

  if (!dialogs) {
    throw new Error("useAppDialogs precisa estar dentro de <AppDialogsProvider>");
  }

  return dialogs;
}
