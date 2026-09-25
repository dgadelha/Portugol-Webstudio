import { useSyncExternalStore } from "react";

import type { WorkspaceState } from "./types";
import { getWorkspaceStore } from "./workspaceStore";

export function useWorkspaceStore() {
  return getWorkspaceStore();
}

/**
 * Lê uma fatia do estado da área de trabalho. O seletor deve devolver um valor estável
 * (uma parte do estado ou um primitivo), nunca um objeto novo a cada chamada.
 */
export function useWorkspace<T>(selector: (state: WorkspaceState) => T): T {
  const store = getWorkspaceStore();

  return useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot()));
}

export function useTabs() {
  return useWorkspace(state => state.tabs);
}

export function useActiveTabId() {
  return useWorkspace(state => state.activeTabId);
}

export function useTab(tabId: string) {
  return useWorkspace(state => state.tabs.find(tab => tab.id === tabId) ?? null);
}
