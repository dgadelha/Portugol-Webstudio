export type TabType = "editor" | "help" | "changelog";

/**
 * Aba como o resto da aplicação enxerga: o conteúdo faz parte do estado.
 */
export interface Tab {
  id: string;
  title: string;
  type: TabType;
  contents: string;
  /**
   * Numa aba de código, o exercício que ela resolve (`pws:<slug>`). A aba não muda de
   * nome, e abrir o mesmo exercício de novo leva até ela.
   */
  exerciseId?: string;
  /**
   * O código de outra pessoa para o mesmo exercício, aberto de um arquivo ou link (um
   * professor conferindo os trabalhos, por exemplo): tem o enunciado e o Verificar, mas não
   * mexe no progresso de quem abriu. Cada arquivo abre na sua aba, com o nome dele.
   */
  exerciseCopy?: boolean;
}

/**
 * A aba do exercício de quem usa o IDE, a que guarda o progresso. As cópias não contam.
 */
export function isOwnExerciseTab(tab: Pick<Tab, "exerciseId" | "exerciseCopy">) {
  return tab.exerciseId !== undefined && !tab.exerciseCopy;
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

let fallbackIdCounter = 0;

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
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  fallbackIdCounter += 1;
  return `${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}`;
}
