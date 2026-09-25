import { settingsStore } from "@/features/settings/settingsStore";
import { randomId } from "@/lib/utils";

import {
  defaultCode,
  DEFAULT_TAB_TITLE,
  isMeaningfulCode,
  RecoverableWorkspace,
  StoredWorkspaceMeta,
  Tab,
  TabType,
  WORKSPACE_SCHEMA_VERSION,
  WorkspaceState,
} from "./types";
import { WorkspaceStorage } from "./workspaceStorage";

/**
 * De quanto em quanto tempo a janela avisa que ainda está viva.
 */
const HEARTBEAT_INTERVAL = 5000;

/**
 * Uma área de trabalho sem sinal de vida por mais que isso é considerada órfã. O limite é
 * generoso de propósito: o navegador estrangula temporizadores de abas em segundo plano, e uma
 * aba viva não pode ser adotada por engano. O caminho rápido de fechar a aba não depende disso —
 * ao fechar, a área é liberada explicitamente.
 */
const HEARTBEAT_STALE_AFTER = 90_000;

/**
 * Silêncio de digitação antes de gravar.
 */
const PERSIST_DEBOUNCE = 500;

const MAX_RECOVERABLE = 10;

const MAX_AGE = 30 /* dias */ * 24 * 60 * 60 * 1000;

export type SingletonTabType = Exclude<TabType, "editor">;

const SINGLETON_TITLES: Record<SingletonTabType, string> = {
  help: "Ajuda",
  changelog: "Histórico de atualizações",
};

/**
 * Dono do estado do IDE: as abas abertas, qual está em foco e o que cada uma contém. A interface
 * lê pelo `useSyncExternalStore` e escreve só por aqui.
 *
 * Cada janela do navegador tem a sua própria área de trabalho, gravada enquanto o usuário digita.
 * Quando a janela é fechada, a área fica órfã e a próxima abertura a adota de volta.
 */
export class WorkspaceStore {
  /**
   * Identifica esta janela; é o que distingue o dono da área de trabalho.
   */
  private readonly sessionId = randomId();

  private workspaceId = randomId();

  private readonly listeners = new Set<() => void>();

  private state: WorkspaceState = {
    tabs: [],
    activeTabId: null,
    recoverable: [],
    restoredFromPreviousSession: false,
  };

  /**
   * Conteúdo das abas de editor. Fica fora do estado observável: mudar o código não é motivo
   * para renderizar a barra de abas.
   */
  private readonly contents = new Map<string, string>();

  /**
   * Espelho do que já está gravado, para escrever só o que mudou.
   */
  private readonly persistedContents = new Map<string, string>();
  private persistedMeta = "";
  private persistTimer?: ReturnType<typeof setTimeout>;

  /**
   * A aba que estava em foco quando a área de trabalho foi adotada. A rota inicial a consome uma
   * única vez para reabrir onde o usuário parou.
   */
  private bootActiveTabId: string | null = null;

  readonly persistenceAvailable: boolean;

  constructor(private readonly storage: WorkspaceStorage) {
    this.persistenceAvailable = storage.available;
    this.bootstrap();
    this.bootActiveTabId = this.state.activeTabId;
  }

  // --- Leitura ------------------------------------------------------------------------------

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.state;

  getTab(tabId: string) {
    return this.state.tabs.find(tab => tab.id === tabId) ?? null;
  }

  getContents(tabId: string) {
    return this.contents.get(tabId) ?? "";
  }

  consumeBootActiveTab() {
    const tab = this.bootActiveTabId ? this.getTab(this.bootActiveTabId) : null;

    this.bootActiveTabId = null;

    return tab;
  }

  // --- Escrita ------------------------------------------------------------------------------

  private setState(patch: Partial<WorkspaceState>) {
    this.state = { ...this.state, ...patch };

    for (const listener of this.listeners) {
      listener();
    }

    // Qualquer mudança de aba, título ou foco agenda uma gravação.
    this.schedulePersist();
  }

  addTab(title?: string, contents?: string): Tab {
    const tab: Tab = { id: randomId(), title: title || DEFAULT_TAB_TITLE, type: "editor" };

    // Aba sem origem começa com o esqueleto de um programa. Um arquivo aberto vazio continua
    // vazio: só a ausência de conteúdo vira o modelo.
    this.contents.set(tab.id, contents ?? defaultCode(settingsStore.editorIndentation()));
    this.setState({ tabs: [...this.state.tabs, tab], activeTabId: tab.id });

    return tab;
  }

  /**
   * Ajuda e histórico de atualizações são abas únicas: se já existem, apenas vêm para frente.
   */
  upsertSingletonTab(type: SingletonTabType) {
    const existing = this.state.tabs.find(tab => tab.type === type);

    if (existing) {
      if (this.state.activeTabId !== existing.id) {
        this.setState({ activeTabId: existing.id });
      }

      return { tab: existing, created: false };
    }

    const tab: Tab = { id: randomId(), title: SINGLETON_TITLES[type], type };

    this.setState({ tabs: [...this.state.tabs, tab], activeTabId: tab.id });

    return { tab, created: true };
  }

  /**
   * Fecha a aba e devolve a que deve ganhar o foco (a vizinha), ou `null` para a aba inicial.
   */
  closeTab(tabId: string): Tab | null {
    const { tabs, activeTabId } = this.state;
    const position = tabs.findIndex(tab => tab.id === tabId);

    if (position === -1) {
      return this.getTab(activeTabId ?? "");
    }

    const neighbour = tabs[position + 1] ?? tabs[position - 1] ?? null;
    const nextActive = activeTabId === tabId ? neighbour : this.getTab(activeTabId ?? "");

    this.contents.delete(tabId);
    this.setState({ tabs: tabs.filter(tab => tab.id !== tabId), activeTabId: nextActive?.id ?? null });

    return nextActive;
  }

  renameTab(tabId: string, title: string) {
    this.setState({ tabs: this.state.tabs.map(tab => (tab.id === tabId ? { ...tab, title } : tab)) });
  }

  setContents(tabId: string, contents: string) {
    this.contents.set(tabId, contents);
    this.schedulePersist();
  }

  setActiveTab(tabId: string | null) {
    if (this.state.activeTabId !== tabId) {
      this.setState({ activeTabId: tabId });
    }
  }

  /**
   * Traz as abas de uma sessão anterior para a área de trabalho atual.
   */
  recover(workspaceId: string) {
    const meta = this.storage.readMeta(workspaceId);

    const restored = (meta?.tabs ?? [])
      .filter(tab => tab.type === "editor")
      .map(tab => ({ tab: { ...tab, id: randomId() }, contents: this.storage.readTab(workspaceId, tab.id) ?? "" }))
      .filter(({ contents }) => isMeaningfulCode(contents));

    for (const { tab, contents } of restored) {
      this.contents.set(tab.id, contents);
    }

    this.storage.deleteWorkspace(workspaceId);

    this.setState({
      tabs: [...this.state.tabs, ...restored.map(({ tab }) => tab)],
      activeTabId: restored[0]?.tab.id ?? this.state.activeTabId,
      recoverable: this.state.recoverable.filter(workspace => workspace.id !== workspaceId),
    });

    return restored.map(({ tab }) => tab);
  }

  discard(workspaceId: string) {
    this.storage.deleteWorkspace(workspaceId);
    this.setState({ recoverable: this.state.recoverable.filter(workspace => workspace.id !== workspaceId) });
  }

  // --- Ciclo de vida da área de trabalho ----------------------------------------------------

  /**
   * Decide com que área de trabalho esta janela começa: a mesma de antes se for um
   * recarregamento, a mais recente deixada para trás se for uma janela nova, ou uma vazia.
   */
  private bootstrap() {
    const orphans = this.collectOrphans();
    const sessionWorkspaceId = this.storage.getSessionWorkspaceId();

    // Recarregar a página mantém o `sessionStorage`, então esta janela recupera exatamente a
    // área que já era dela.
    if (sessionWorkspaceId && this.adopt(sessionWorkspaceId)) {
      this.state.recoverable = orphans.filter(workspace => workspace.id !== sessionWorkspaceId);
      return;
    }

    const [latest, ...rest] = orphans;

    if (latest && this.adopt(latest.id)) {
      this.state.restoredFromPreviousSession = true;
      this.state.recoverable = rest;
      return;
    }

    this.state.recoverable = orphans;
    this.claim();
  }

  /**
   * Áreas de trabalho com código dentro que nenhuma janela viva está usando, da mais recente
   * para a mais antiga. Também é a hora de limpar o que passou do prazo ou do limite.
   */
  private collectOrphans() {
    const now = Date.now();
    const sessionWorkspaceId = this.storage.getSessionWorkspaceId();
    const orphans: RecoverableWorkspace[] = [];
    const expired: string[] = [];

    for (const id of this.storage.listWorkspaceIds()) {
      const meta = this.storage.readMeta(id);

      if (!meta) {
        continue;
      }

      const heartbeat = this.storage.readHeartbeat(id);
      const isLive = heartbeat !== null && !heartbeat.released && now - heartbeat.at < HEARTBEAT_STALE_AFTER;

      // A área desta própria janela não é órfã, mesmo que o relógio diga o contrário.
      if (isLive || id === sessionWorkspaceId) {
        continue;
      }

      if (now - meta.updatedAt > MAX_AGE) {
        expired.push(id);
        continue;
      }

      const tabTitles = meta.tabs
        .filter(tab => tab.type === "editor" && isMeaningfulCode(this.storage.readTab(id, tab.id) ?? ""))
        .map(tab => tab.title);

      if (tabTitles.length > 0) {
        orphans.push({ id, updatedAt: meta.updatedAt, tabTitles });
      } else {
        // Sem nada que valha a pena guardar: só ocupa espaço.
        expired.push(id);
      }
    }

    orphans.sort((a, b) => b.updatedAt - a.updatedAt);

    this.storage.deleteWorkspaces([...expired, ...orphans.slice(MAX_RECOVERABLE).map(workspace => workspace.id)]);

    return orphans.slice(0, MAX_RECOVERABLE);
  }

  /**
   * Carrega uma área de trabalho gravada para dentro do estado desta janela.
   */
  private adopt(workspaceId: string) {
    const meta = this.storage.readMeta(workspaceId);

    if (!meta) {
      return false;
    }

    const tabs = meta.tabs.map(({ id, title, type }) => ({ id, title, type }));

    for (const tab of tabs) {
      const contents = tab.type === "editor" ? (this.storage.readTab(workspaceId, tab.id) ?? "") : "";

      this.contents.set(tab.id, contents);
      // O que acabou de ser lido já está gravado: não reescreve nada por isso.
      this.persistedContents.set(tab.id, contents);
    }

    this.workspaceId = workspaceId;
    this.state.tabs = tabs;
    this.state.activeTabId = tabs.some(tab => tab.id === meta.activeTabId) ? meta.activeTabId : null;
    this.persistedMeta = this.serializeMeta();
    this.claim();

    return true;
  }

  /**
   * Marca esta janela como dona da área de trabalho atual.
   */
  private claim() {
    this.storage.setSessionWorkspaceId(this.workspaceId);
    this.writeHeartbeat(false);
  }

  private writeHeartbeat(released: boolean) {
    this.storage.writeHeartbeat(this.workspaceId, { ownerId: this.sessionId, at: Date.now(), released });
  }

  private ownedByAnotherWindow() {
    const heartbeat = this.storage.readHeartbeat(this.workspaceId);

    return heartbeat !== null && heartbeat.ownerId !== this.sessionId;
  }

  private release() {
    if (!this.ownedByAnotherWindow()) {
      this.writeHeartbeat(true);
    }
  }

  private heartbeat() {
    if (this.ownedByAnotherWindow()) {
      // Outra janela adotou esta área enquanto ficamos sem dar sinal de vida (máquina suspensa,
      // por exemplo). Em vez de escrever por cima do que ela já está editando, seguimos em uma
      // área nova.
      this.fork();
      return;
    }

    this.writeHeartbeat(false);
  }

  private fork() {
    this.workspaceId = randomId();
    this.persistedContents.clear();
    this.persistedMeta = "";
    this.claim();
    this.persistNow();
  }

  /**
   * Liga o heartbeat e os eventos da janela. Devolve a função que desliga tudo.
   */
  start() {
    if (!this.storage.available) {
      return () => {};
    }

    const interval = setInterval(() => {
      this.heartbeat();
    }, HEARTBEAT_INTERVAL);

    const onPageHide = () => {
      // Único momento garantido antes de a aba morrer: grava e libera a área para que a próxima
      // janela a encontre na hora.
      this.persistNow();
      this.release();
    };

    const onPageShow = () => {
      // Voltando do cache de navegação: reassume a área de trabalho.
      this.heartbeat();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        this.persistNow();
      } else {
        this.heartbeat();
      }
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }

  // --- Persistência -------------------------------------------------------------------------

  private schedulePersist() {
    if (!this.storage.available) {
      return;
    }

    clearTimeout(this.persistTimer);

    this.persistTimer = setTimeout(() => {
      this.persistNow();
    }, PERSIST_DEBOUNCE);
  }

  private serializeMeta() {
    return JSON.stringify({ activeTabId: this.state.activeTabId, tabs: this.state.tabs });
  }

  private persistNow() {
    if (!this.storage.available) {
      return;
    }

    clearTimeout(this.persistTimer);
    this.persistTimer = undefined;

    const { tabs, activeTabId } = this.state;
    let changed = false;

    for (const tab of tabs) {
      const contents = this.getContents(tab.id);

      if (this.persistedContents.get(tab.id) !== contents) {
        this.storage.writeTab(this.workspaceId, tab.id, contents);
        this.persistedContents.set(tab.id, contents);
        changed = true;
      }
    }

    const live = new Set(tabs.map(tab => tab.id));

    for (const tabId of this.persistedContents.keys()) {
      if (!live.has(tabId)) {
        this.storage.deleteTab(this.workspaceId, tabId);
        this.persistedContents.delete(tabId);
        changed = true;
      }
    }

    const meta = this.serializeMeta();

    if (changed || meta !== this.persistedMeta) {
      const payload: StoredWorkspaceMeta = {
        version: WORKSPACE_SCHEMA_VERSION,
        id: this.workspaceId,
        updatedAt: Date.now(),
        activeTabId,
        tabs: tabs.map(({ id, title, type }) => ({ id, title, type })),
      };

      this.storage.writeMeta(payload);
      this.persistedMeta = meta;
    }
  }
}

let instance: WorkspaceStore | undefined;

/**
 * Uma área de trabalho por janela: o store é criado uma única vez, fora do ciclo de render
 * (o `StrictMode` executaria inicializadores duas vezes e reivindicaria a área em dobro).
 */
export function getWorkspaceStore() {
  instance ??= new WorkspaceStore(new WorkspaceStorage());

  return instance;
}
