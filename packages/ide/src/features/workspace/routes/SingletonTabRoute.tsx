import { useEffect } from "react";

import { useWorkspaceStore } from "../useWorkspace";
import type { SingletonTabType } from "../workspaceStore";

/**
 * `/ajuda` e `/novidades` — abas únicas: o endereço abre a aba se ela ainda não existir.
 */
export function SingletonTabRoute({ type }: { type: SingletonTabType }) {
  const store = useWorkspaceStore();

  useEffect(() => {
    store.upsertSingletonTab(type);
  }, [store, type]);

  return null;
}
