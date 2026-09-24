import { computed, DestroyRef, effect, inject, NgZone, Service, signal, untracked } from "@angular/core";
import { WorkspaceStorageService } from "./workspace-storage.service";
import {
  DEFAULT_CODE,
  DEFAULT_TAB_TITLE,
  isMeaningfulCode,
  randomId,
  RecoverableWorkspace,
  StoredWorkspaceMeta,
  Tab,
  TabType,
  WORKSPACE_SCHEMA_VERSION,
} from "./workspace.types";

/**
 * De quanto em quanto tempo a janela avisa que ainda está viva.
 */
const HEARTBEAT_INTERVAL = 5000;

/**
 * Uma área de trabalho sem sinal de vida por mais que isso é considerada órfã.
 * O limite é generoso de propósito: o navegador estrangula temporizadores de
 * abas em segundo plano, e uma aba viva não pode ser adotada por engano. O
 * caminho rápido de fechar a aba não depende disso — ao fechar, a área é
 * liberada explicitamente.
 */
const HEARTBEAT_STALE_AFTER = 90_000;

/**
 * Silêncio de digitação antes de gravar.
 */
const PERSIST_DEBOUNCE = 500;

const MAX_RECOVERABLE = 10;

const MAX_AGE = 30 /* dias */ * 24 * 60 * 60 * 1000;

/**
 * Dono do estado do IDE: as abas abertas, qual está em foco e o que cada uma
 * contém. Os componentes leem e escrevem só por aqui — nenhum deles guarda
 * código que o resto da aplicação não enxergue.
 *
 * Cada janela do navegador tem a sua própria área de trabalho, gravada enquanto
 * o usuário digita. Quando a janela é fechada, a área fica órfã e a próxima
 * abertura a adota de volta.
 */
@Service()
export class WorkspaceService {
  private readonly storage = inject(WorkspaceStorageService);
  private readonly zone = inject(NgZone);
  private readonly lifetime = inject(DestroyRef);

  /**
   * Identifica esta janela; é o que distingue o dono da área de trabalho.
   */
  private readonly sessionId = randomId();

  private workspaceId = randomId();

  /**
   * Espelho do que já está gravado, para escrever só o que mudou.
   */
  private readonly persistedContents = new Map<string, string>();
  private persistedMeta = "";
  private persistTimer?: ReturnType<typeof setTimeout>;

  readonly tabs = signal<Tab[]>([]);
  readonly activeTabId = signal<string | null>(null);

  /**
   * Áreas de trabalho de sessões anteriores que o usuário ainda pode recuperar.
   */
  readonly recoverable = signal<RecoverableWorkspace[]>([]);

  /**
   * Verdadeiro quando esta sessão começou adotando o código de uma janela fechada.
   */
  readonly restoredFromPreviousSession = signal(false);

  readonly persistenceAvailable = this.storage.available;

  readonly activeTab = computed(() => this.tabs().find(tab => tab.id === this.activeTabId()) ?? null);

  constructor() {
    this.bootstrap();

    effect(() => {
      // Qualquer mudança de aba, título, conteúdo ou foco agenda uma gravação.
      this.tabs();
      this.activeTabId();
      this.schedulePersist();
    });

    this.watchWindowLifecycle();
  }

  addTab(title?: string, contents?: string) {
    const tab: Tab = {
      id: randomId(),
      title: title || DEFAULT_TAB_TITLE,
      type: "editor",
      // Aba sem origem começa com o esqueleto de um programa. Um arquivo aberto
      // vazio continua vazio: só a ausência de conteúdo vira o modelo.
      contents: contents ?? DEFAULT_CODE,
    };

    this.tabs.update(tabs => [...tabs, tab]);
    this.activeTabId.set(tab.id);

    return tab.id;
  }

  /**
   * A ajuda é uma aba só: se já existe, apenas a traz para frente.
   */
  upsertHelpTab() {
    return this.upsertSingleTab("help", "Ajuda");
  }

  /**
   * O histórico de atualizações também é uma aba só.
   */
  upsertChangelogTab() {
    return this.upsertSingleTab("changelog", "Histórico de atualizações");
  }

  private upsertSingleTab(type: Exclude<TabType, "editor">, title: string) {
    const existing = untracked(this.tabs).find(tab => tab.type === type);

    if (existing) {
      this.activeTabId.set(existing.id);
      return { id: existing.id, created: false };
    }

    const tab: Tab = {
      id: randomId(),
      title,
      type,
      contents: "",
    };

    this.tabs.update(tabs => [...tabs, tab]);
    this.activeTabId.set(tab.id);

    return { id: tab.id, created: true };
  }

  closeTab(tabId: string) {
    const tabs = untracked(this.tabs);
    const position = tabs.findIndex(tab => tab.id === tabId);

    if (position === -1) {
      return;
    }

    this.tabs.set(tabs.filter(tab => tab.id !== tabId));

    if (untracked(this.activeTabId) === tabId) {
      // Foca a aba vizinha; se era a última, volta para a aba inicial.
      const neighbour = tabs[position + 1] ?? tabs[position - 1];
      this.activeTabId.set(neighbour?.id ?? null);
    }
  }

  renameTab(tabId: string, title: string) {
    this.tabs.update(tabs => tabs.map(tab => (tab.id === tabId ? { ...tab, title } : tab)));
  }

  setContents(tabId: string, contents: string) {
    this.tabs.update(tabs => tabs.map(tab => (tab.id === tabId ? { ...tab, contents } : tab)));
  }

  setActiveTab(tabId: string | null) {
    this.activeTabId.set(tabId);
  }

  contentsOf(tabId: string) {
    return this.tabs().find(tab => tab.id === tabId)?.contents ?? "";
  }

  titleOf(tabId: string) {
    return this.tabs().find(tab => tab.id === tabId)?.title ?? DEFAULT_TAB_TITLE;
  }

  /**
   * Traz as abas de uma sessão anterior para a área de trabalho atual.
   */
  recover(workspaceId: string) {
    const meta = this.storage.readMeta(workspaceId);

    const restored = (meta?.tabs ?? [])
      .filter(tab => tab.type === "editor")
      .map<Tab>(tab => {
        return {
          id: randomId(),
          title: tab.title,
          type: "editor",
          contents: this.storage.readTab(workspaceId, tab.id) ?? "",
        };
      })
      .filter(tab => isMeaningfulCode(tab.contents));

    if (restored.length > 0) {
      this.tabs.update(tabs => [...tabs, ...restored]);
      this.activeTabId.set(restored[0].id);
    }

    this.discard(workspaceId);

    return restored.length;
  }

  discard(workspaceId: string) {
    this.storage.deleteWorkspace(workspaceId);
    this.recoverable.update(workspaces => workspaces.filter(workspace => workspace.id !== workspaceId));
  }

  /**
   * Decide com que área de trabalho esta janela começa: a mesma de antes se for
   * um recarregamento, a mais recente deixada para trás se for uma janela nova,
   * ou uma vazia.
   */
  private bootstrap() {
    const orphans = this.collectOrphans();
    const sessionWorkspaceId = this.storage.getSessionWorkspaceId();

    // Recarregar a página mantém o `sessionStorage`, então esta janela recupera
    // exatamente a área que já era dela.
    if (sessionWorkspaceId && this.adopt(sessionWorkspaceId)) {
      this.recoverable.set(orphans.filter(workspace => workspace.id !== sessionWorkspaceId));
      return;
    }

    const [latest, ...rest] = orphans;

    if (latest && this.adopt(latest.id)) {
      this.restoredFromPreviousSession.set(true);
      this.recoverable.set(rest);
      return;
    }

    this.recoverable.set(orphans);
    this.claim();
  }

  /**
   * Áreas de trabalho com código dentro que nenhuma janela viva está usando,
   * da mais recente para a mais antiga. Também é a hora de limpar o que passou
   * do prazo ou do limite.
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

    const tabs = meta.tabs.map<Tab>(tab => {
      return {
        ...tab,
        contents: tab.type === "editor" ? (this.storage.readTab(workspaceId, tab.id) ?? "") : "",
      };
    });

    this.workspaceId = workspaceId;
    this.tabs.set(tabs);
    this.activeTabId.set(tabs.some(tab => tab.id === meta.activeTabId) ? meta.activeTabId : null);

    // O que acabou de ser lido já está gravado: não reescreve nada por isso.
    for (const tab of tabs) {
      this.persistedContents.set(tab.id, tab.contents);
    }

    this.persistedMeta = this.serializeMeta(tabs, untracked(this.activeTabId));
    this.claim();

    return true;
  }

  /**
   * Marca esta janela como dona da área de trabalho atual.
   */
  private claim() {
    this.storage.setSessionWorkspaceId(this.workspaceId);
    this.storage.writeHeartbeat(this.workspaceId, {
      ownerId: this.sessionId,
      at: Date.now(),
      released: false,
    });
  }

  private release() {
    const heartbeat = this.storage.readHeartbeat(this.workspaceId);

    if (heartbeat && heartbeat.ownerId !== this.sessionId) {
      return;
    }

    this.storage.writeHeartbeat(this.workspaceId, {
      ownerId: this.sessionId,
      at: Date.now(),
      released: true,
    });
  }

  private heartbeat() {
    const heartbeat = this.storage.readHeartbeat(this.workspaceId);

    if (heartbeat && heartbeat.ownerId !== this.sessionId) {
      // Outra janela adotou esta área enquanto ficamos sem dar sinal de vida
      // (máquina suspensa, por exemplo). Em vez de escrever por cima do que ela
      // já está editando, seguimos em uma área nova.
      this.zone.run(() => {
        this.fork();
      });
      return;
    }

    this.storage.writeHeartbeat(this.workspaceId, {
      ownerId: this.sessionId,
      at: Date.now(),
      released: false,
    });
  }

  private fork() {
    this.workspaceId = randomId();
    this.persistedContents.clear();
    this.persistedMeta = "";
    this.claim();
    this.persistNow();
  }

  private watchWindowLifecycle() {
    if (!this.storage.available) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const interval = setInterval(() => {
        this.heartbeat();
      }, HEARTBEAT_INTERVAL);

      const onPageHide = () => {
        // Único momento garantido antes de a aba morrer: grava e libera a área
        // para que a próxima janela a encontre na hora.
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

      this.lifetime.onDestroy(() => {
        clearInterval(interval);
        window.removeEventListener("pagehide", onPageHide);
        window.removeEventListener("pageshow", onPageShow);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      });
    });
  }

  private schedulePersist() {
    if (!this.storage.available) {
      return;
    }

    clearTimeout(this.persistTimer);

    this.zone.runOutsideAngular(() => {
      this.persistTimer = setTimeout(() => {
        this.persistNow();
      }, PERSIST_DEBOUNCE);
    });
  }

  private serializeMeta(tabs: Tab[], activeTabId: string | null) {
    return JSON.stringify({
      activeTabId,
      tabs: tabs.map(({ id, title, type }) => ({ id, title, type })),
    });
  }

  private persistNow() {
    if (!this.storage.available) {
      return;
    }

    clearTimeout(this.persistTimer);
    this.persistTimer = undefined;

    const tabs = untracked(this.tabs);
    const activeTabId = untracked(this.activeTabId);
    let changed = false;

    for (const tab of tabs) {
      if (this.persistedContents.get(tab.id) !== tab.contents) {
        this.storage.writeTab(this.workspaceId, tab.id, tab.contents);
        this.persistedContents.set(tab.id, tab.contents);
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

    const meta = this.serializeMeta(tabs, activeTabId);

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
