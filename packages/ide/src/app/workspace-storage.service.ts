import { Service } from "@angular/core";
import { StoredWorkspaceMeta, WORKSPACE_SCHEMA_VERSION, WorkspaceHeartbeat } from "./workspace.types";

const NAMESPACE = "pws:ws";
const SESSION_KEY = "pws:ws-session";

const metaKey = (workspaceId: string) => `${NAMESPACE}:${workspaceId}`;
const heartbeatKey = (workspaceId: string) => `${NAMESPACE}:${workspaceId}:hb`;
const tabKey = (workspaceId: string, tabId: string) => `${NAMESPACE}:${workspaceId}:t:${tabId}`;

/**
 * `localStorage` pode existir e ainda assim falhar (modo privado, cota zerada,
 * armazenamento bloqueado por política), então só aceitamos um storage depois
 * de escrever e ler de volta.
 */
function usableStorage(get: () => Storage) {
  try {
    const storage = get();
    const probe = `${NAMESPACE}:probe`;

    storage.setItem(probe, "1");
    const works = storage.getItem(probe) === "1";
    storage.removeItem(probe);

    return works ? storage : null;
  } catch {
    return null;
  }
}

function isHeartbeat(value: unknown): value is WorkspaceHeartbeat {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { ownerId, at, released } = value as Record<string, unknown>;

  return typeof ownerId === "string" && typeof at === "number" && Number.isFinite(at) && typeof released === "boolean";
}

/**
 * Camada de persistência da área de trabalho: só conhece chaves e JSON, nada de
 * estado da aplicação. Toda operação é tolerante a falha — se o navegador não
 * deixa gravar, o IDE continua funcionando sem salvar.
 */
@Service()
export class WorkspaceStorageService {
  private readonly local = usableStorage(() => localStorage);
  private readonly session = usableStorage(() => sessionStorage);

  readonly available = this.local !== null;

  private read(key: string) {
    try {
      return this.local?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: string) {
    try {
      this.local?.setItem(key, value);
      return true;
    } catch (error) {
      // Cota estourada ou armazenamento revogado no meio da sessão: o código em
      // edição continua na memória, apenas não é mais salvo.
      console.warn("Failed to persist workspace data", error);
      return false;
    }
  }

  private remove(key: string) {
    try {
      this.local?.removeItem(key);
    } catch {
      // Nada a fazer: a chave já é inacessível.
    }
  }

  private readJson(key: string): unknown {
    const raw = this.read(key);

    if (raw === null) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Ids de todas as áreas de trabalho gravadas, inclusive as desta sessão.
   */
  listWorkspaceIds() {
    const ids: string[] = [];

    try {
      for (let i = 0; i < (this.local?.length ?? 0); i++) {
        const key = this.local?.key(i);
        const parts = key?.split(":");

        // Só a chave de metadados tem 3 partes: `pws:ws:<id>`.
        if (parts?.length === 3 && `${parts[0]}:${parts[1]}` === NAMESPACE) {
          ids.push(parts[2]);
        }
      }
    } catch (error) {
      console.warn("Failed to list workspaces", error);
    }

    return ids;
  }

  readMeta(workspaceId: string) {
    const meta = this.readJson(metaKey(workspaceId)) as StoredWorkspaceMeta | null;

    // Uma versão diferente da nossa é deixada intacta: pode ser de uma versão
    // mais nova do IDE aberta em outra aba.
    if (!meta || meta.version !== WORKSPACE_SCHEMA_VERSION || !Array.isArray(meta.tabs)) {
      return null;
    }

    return meta;
  }

  writeMeta(meta: StoredWorkspaceMeta) {
    return this.write(metaKey(meta.id), JSON.stringify(meta));
  }

  readTab(workspaceId: string, tabId: string) {
    return this.read(tabKey(workspaceId, tabId));
  }

  writeTab(workspaceId: string, tabId: string, contents: string) {
    return this.write(tabKey(workspaceId, tabId), contents);
  }

  deleteTab(workspaceId: string, tabId: string) {
    this.remove(tabKey(workspaceId, tabId));
  }

  readHeartbeat(workspaceId: string) {
    const heartbeat = this.readJson(heartbeatKey(workspaceId));

    return isHeartbeat(heartbeat) ? heartbeat : null;
  }

  writeHeartbeat(workspaceId: string, heartbeat: WorkspaceHeartbeat) {
    this.write(heartbeatKey(workspaceId), JSON.stringify(heartbeat));
  }

  deleteWorkspace(workspaceId: string) {
    const prefix = `${NAMESPACE}:${workspaceId}:`;
    const keys: string[] = [];

    try {
      for (let i = 0; i < (this.local?.length ?? 0); i++) {
        const key = this.local?.key(i);

        if (key?.startsWith(prefix)) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.warn("Failed to delete workspace", error);
    }

    for (const key of keys) {
      this.remove(key);
    }

    this.remove(metaKey(workspaceId));
  }

  getSessionWorkspaceId() {
    try {
      return this.session?.getItem(SESSION_KEY) ?? null;
    } catch {
      return null;
    }
  }

  setSessionWorkspaceId(workspaceId: string) {
    try {
      this.session?.setItem(SESSION_KEY, workspaceId);
    } catch (error) {
      console.warn("Failed to persist the session workspace id", error);
    }
  }

  deleteWorkspaces(workspaceIds: string[]) {
    for (const workspaceId of workspaceIds) {
      this.deleteWorkspace(workspaceId);
    }
  }
}
