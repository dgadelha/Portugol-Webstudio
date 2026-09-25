export type TabType = "editor" | "help" | "changelog";

/**
 * Aba como o resto da aplicação enxerga: o conteúdo faz parte do estado.
 */
export interface Tab {
  id: string;
  title: string;
  type: TabType;
  contents: string;
}

/**
 * O conteúdo de cada aba mora em uma chave própria, então os metadados guardam
 * apenas a ordem, os títulos e os tipos.
 */
export type StoredTab = Omit<Tab, "contents">;

export interface StoredWorkspaceMeta {
  version: number;
  id: string;
  updatedAt: number;
  activeTabId: string | null;
  tabs: StoredTab[];
}

/**
 * Marca de vida da área de trabalho. Enquanto uma janela está aberta ela renova
 * `at`; ao fechar, marca `released`, o que libera a área para ser recuperada na
 * próxima abertura sem esperar o tempo de expiração.
 */
export interface WorkspaceHeartbeat {
  ownerId: string;
  at: number;
  released: boolean;
}

/**
 * Área de trabalho de uma sessão anterior que pode ser recuperada.
 */
export interface RecoverableWorkspace {
  id: string;
  updatedAt: number;
  tabTitles: string[];
}

export const WORKSPACE_SCHEMA_VERSION = 1;

/**
 * Esqueleto de um programa novo, indentado com `indent` em cada nível.
 */
export function defaultCode(indent: string) {
  return `programa {\n${indent}funcao inicio() {\n${indent.repeat(2)}\n${indent}}\n}\n`;
}

export const DEFAULT_TAB_TITLE = "Sem título";

/**
 * Código que vale a pena guardar: nem vazio, nem o esqueleto que toda aba nova
 * já vem preenchida.
 */
export function isMeaningfulCode(contents: string) {
  // Sem os espaços, o esqueleto é o mesmo com qualquer indentação — inclusive
  // o de uma aba criada antes de o tamanho da tabulação mudar.
  const code = contents.replaceAll(/\s/g, "");

  return code.length > 0 && code !== defaultCode("").replaceAll(/\s/g, "");
}

export function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
