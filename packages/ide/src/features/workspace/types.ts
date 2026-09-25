export type TabType = "editor" | "help" | "changelog";

/**
 * Aba como a interface enxerga. O conteúdo de cada aba de editor fica à parte, no store,
 * para que digitar não renderize de novo tudo o que depende da lista de abas.
 */
export interface Tab {
  id: string;
  title: string;
  type: TabType;
}

export interface StoredWorkspaceMeta {
  version: number;
  id: string;
  updatedAt: number;
  activeTabId: string | null;
  tabs: Tab[];
}

/**
 * Marca de vida da área de trabalho. Enquanto uma janela está aberta ela renova `at`; ao fechar,
 * marca `released`, o que libera a área para ser recuperada na próxima abertura sem esperar o
 * tempo de expiração.
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

export interface WorkspaceState {
  tabs: Tab[];
  activeTabId: string | null;
  /**
   * Áreas de trabalho de sessões anteriores que o usuário ainda pode recuperar.
   */
  recoverable: RecoverableWorkspace[];
  /**
   * Verdadeiro quando esta sessão começou adotando o código de uma janela fechada.
   */
  restoredFromPreviousSession: boolean;
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
 * Código que vale a pena guardar: nem vazio, nem o esqueleto que toda aba nova já vem preenchida.
 */
export function isMeaningfulCode(contents: string) {
  // Sem os espaços, o esqueleto é o mesmo com qualquer indentação — inclusive
  // o de uma aba criada antes de o tamanho da tabulação mudar.
  const code = contents.replaceAll(/\s/g, "");

  return code.length > 0 && code !== defaultCode("").replaceAll(/\s/g, "");
}
