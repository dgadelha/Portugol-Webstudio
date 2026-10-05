import { inject, Injector, NgZone, Service, signal } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { interval } from "rxjs";
import { DownloadProgressToastComponent } from "./download-progress-toast/download-progress-toast.component";
import { NewVersionAvailableComponent } from "./new-version-available/new-version-available.component";
import { DownloadProgress, DownloadToastData, OfflineStatus, UpdateStatus } from "./pwa.types";
import { WorkspaceService } from "./workspace.service";

/**
 * Intervalo entre as conferências do cache durante um download.
 */
const PROGRESS_POLL_MS = 1000;

/**
 * Quantos arquivos o `caches.match` confere de uma vez.
 */
const PROGRESS_BATCH = 200;

/**
 * Quantos arquivos que faltam a página pede ao service worker ao mesmo tempo.
 */
const REFILL_CONCURRENCY = 4;

@Service()
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private toast = inject(HotToastService);
  private zone = inject(NgZone);
  private injector = inject(Injector);

  readonly offlineStatus = signal<OfflineStatus>("unsupported");
  readonly offlineProgress = signal<DownloadProgress | null>(null);

  readonly updateStatus = signal<UpdateStatus>("idle");
  readonly updateProgress = signal<DownloadProgress | null>(null);

  readonly online = signal(navigator.onLine);

  loadingToast?: CreateHotToastRef<unknown>;
  versionReadyToast?: CreateHotToastRef<unknown>;
  private offlineToast?: CreateHotToastRef<unknown>;

  /**
   * Versão sendo baixada. O service worker avisa de novo a cada verificação que acontece
   * durante o download (a de cada navegação, a de outras abas, a periódica), porque a
   * versão só conta como conhecida quando termina de baixar.
   */
  private downloadingHash?: string;
  private readyHash?: string;

  /**
   * Cancela o acompanhamento de um download (o da primeira visita ou o de uma atualização).
   */
  private stopUpdateProgress?: () => void;

  /**
   * Arquivos que faltavam no cache na última conferência, numa visita com service worker.
   */
  private offlineMissing: readonly string[] = [];

  /**
   * O service worker conferiu que não há versão nova: os arquivos que faltam são da versão
   * aberta, e não de uma atualização que ele ainda vai baixar.
   */
  private latestConfirmed = false;
  private refilling = false;

  constructor() {
    window.addEventListener("online", () => {
      this.online.set(true);
    });
    window.addEventListener("offline", () => {
      this.online.set(false);
    });

    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.watchOfflineCopy();

    this.swUpdate.versionUpdates.subscribe(event => {
      console.log("PWA:", event);

      switch (event.type) {
        case "VERSION_DETECTED": {
          const { hash } = event.version;

          if (hash === this.downloadingHash || hash === this.readyHash) {
            break;
          }

          this.downloadingHash = hash;
          this.latestConfirmed = false;
          this.updateStatus.set("downloading");
          this.updateProgress.set(null);
          this.loadingToast?.close();
          // Uma versão pronta antes desta deixa de ser a novidade: a desta avisa quando ficar pronta
          this.versionReadyToast?.close();

          this.loadingToast = this.toast.show<DownloadToastData>(DownloadProgressToastComponent, {
            data: { kind: "update", progress: this.updateProgress },
            autoClose: false,
            dismissible: true,
          });

          // Na atualização, conta só o que ainda não estava no cache: os arquivos novos.
          // Os que mudaram sem mudar de nome já constam, então a barra pode chegar ao fim
          // um pouco antes de a versão ficar pronta (o aviso mostra "Finalizando…").
          this.stopUpdateProgress?.();
          this.stopUpdateProgress = this.trackDownload("pending", progress => {
            this.updateProgress.set(progress);
          });

          break;
        }

        case "VERSION_READY": {
          const { hash } = event.latestVersion;

          this.finishUpdateDownload();

          if (hash === this.readyHash) {
            break;
          }

          this.readyHash = hash;
          this.updateStatus.set("ready");
          this.versionReadyToast?.close();

          this.versionReadyToast = this.toast.success(NewVersionAvailableComponent, {
            data: {
              reload: () => {
                this.reloadToUpdate();
              },
            },
            autoClose: false,
            dismissible: true,
          });

          break;
        }

        case "VERSION_INSTALLATION_FAILED": {
          console.error("PWA: falha ao instalar a atualização", event.error);

          // A próxima verificação tenta de novo, e mostra o aviso de novo
          this.finishUpdateDownload();
          this.updateStatus.set("failed");
          break;
        }

        case "NO_NEW_VERSION_DETECTED": {
          // Uma versão já pronta continua pronta: a verificação só não achou outra
          if (this.updateStatus() === "checking") {
            this.updateStatus.set("latest");
          }

          this.latestConfirmed = true;
          this.refillOfflineCopy();

          break;
        }

        default: {
          break;
        }
      }
    });

    // O navegador pode apagar arquivos do cache que a versão aberta ainda usa
    this.swUpdate.unrecoverable.subscribe(event => {
      console.error("PWA: estado irrecuperável", event.reason);

      this.toast.error(
        "Não foi possível carregar uma parte do Portugol Webstudio. Salve seus arquivos e recarregue a página.",
        { autoClose: false, dismissible: true },
      );
    });

    // O service worker já verifica a cada carregamento da página; esta é para quem deixa o IDE
    // aberto. Fora da zona do Angular, para o timer não impedir a aplicação de ficar estável
    // (é quando o service worker é registrado).
    this.zone.runOutsideAngular(() => {
      interval(/* 30 min */ 30 * 60 * 1000).subscribe(() => {
        this.swUpdate.checkForUpdate().catch(() => {});
      });
    });
  }

  /**
   * A verificação pedida no Sobre. O `checkForUpdate` só termina quando a versão nova
   * acaba de baixar; enquanto isso, os eventos atualizam o `updateStatus`.
   */
  async checkForUpdate() {
    if (!this.swUpdate.isEnabled || this.updateStatus() === "downloading") {
      return;
    }

    if (!this.online()) {
      this.updateStatus.set("offline");
      return;
    }

    if (this.updateStatus() !== "ready") {
      this.updateStatus.set("checking");
    }

    try {
      const found = await this.swUpdate.checkForUpdate();

      if (!found && this.updateStatus() === "checking") {
        // Sem conexão com o servidor, o service worker desiste em silêncio
        this.updateStatus.set(navigator.onLine ? "latest" : "offline");
      }
    } catch (error) {
      console.error("PWA: falha ao verificar atualizações", error);
      this.updateStatus.set("failed");
    }
  }

  /**
   * O código das abas fica guardado no navegador e volta igual depois de recarregar, então
   * só pergunta antes quando o navegador não está guardando nada. A área de trabalho é
   * buscada aqui, e não injetada, para o serviço (criado na inicialização) não carregá-la antes.
   */
  reloadToUpdate() {
    const workspace = this.injector.get(WorkspaceService);

    if (
      !workspace.persistenceAvailable &&
      !confirm(
        "Seu navegador não está salvando o código. Baixe seus arquivos antes de atualizar, ou eles serão perdidos.\n\nAtualizar agora?",
      )
    ) {
      return;
    }

    workspace.saveNow();
    window.location.reload();
  }

  private finishUpdateDownload() {
    this.downloadingHash = undefined;
    this.stopUpdateProgress?.();
    this.stopUpdateProgress = undefined;
    // O progresso fica no último valor: o aviso ainda aparece na animação de saída
    this.loadingToast?.close();
  }

  /**
   * O service worker baixa a cópia para usar sem internet quando a página fica ociosa, e
   * não avisa quando termina. Então a página confere o cache até ter todos os arquivos.
   *
   * Sem service worker controlando a página quando ela abriu, é a primeira visita (ou o
   * cache foi apagado), e o download tem aviso. Com service worker, a conferência é calada:
   * quem fechou a aba antes do fim da primeira visita ainda não tem tudo, e o Sobre não
   * deve dizer que está pronto. Um recarregamento forçado (Shift) também abre sem service
   * worker, mas aí o cache já está completo na primeira conferência, e nada é avisado.
   *
   * Com uma atualização publicada, a lista do servidor é a da versão nova, e os arquivos
   * dela faltariam no cache até ela ser baixada. A página sabe que a lista não é a dela
   * quando o `main-*.js` que ela carregou não está na lista: aí não há como conferir a
   * versão aberta, e quem volta com service worker está pronto (a versão nova chega pelo
   * aviso de atualização, com a barra dela).
   */
  private watchOfflineCopy() {
    if (!("caches" in window)) {
      return;
    }

    const returning = Boolean(navigator.serviceWorker.controller);

    this.offlineStatus.set("checking");

    const onNewerVersion = returning
      ? () => {
          this.offlineStatus.set("ready");
        }
      : undefined;

    this.trackDownload(
      "all",
      (progress, pending) => {
        if (!progress) {
          // Sem a lista, não dá para conferir. Quem volta com service worker está com o IDE
          // aberto pelo cache (sem internet, a lista não chega); na primeira visita, não se sabe.
          this.offlineStatus.set(returning ? "ready" : "unknown");
          return;
        }

        if (progress.done < progress.total) {
          this.offlineStatus.set("downloading");
          this.offlineProgress.set(progress);

          if (returning) {
            this.offlineMissing = pending;
            this.refillOfflineCopy();
          } else {
            this.offlineToast ??= this.toast.show<DownloadToastData>(DownloadProgressToastComponent, {
              data: { kind: "offline", progress: this.offlineProgress },
              autoClose: false,
              dismissible: true,
            });
          }

          return;
        }

        this.offlineStatus.set("ready");
        this.offlineMissing = [];

        if (this.offlineToast) {
          this.offlineToast.close();

          this.toast.success("O Portugol Webstudio já pode ser usado sem internet.", {
            duration: 8000,
            dismissible: true,
          });
        }
      },
      onNewerVersion,
    );
  }

  /**
   * Acompanha o download pelo cache: os arquivos que o service worker baixa na instalação
   * estão no `ngsw.json`, e cada um fica guardado pelo próprio endereço, então o
   * `caches.match` diz se já chegou. Com `"all"`, o total é a lista inteira (primeira
   * visita); com `"pending"`, só o que faltava quando começou (atualização).
   *
   * Se a lista não puder ser lida, avisa `null` e o aviso mostra a barra sem porcentagem.
   * Devolve uma função que para o acompanhamento.
   */
  private trackDownload(
    scope: "all" | "pending",
    onProgress: (progress: DownloadProgress | null, pending: readonly string[]) => void,
    onNewerVersion?: () => void,
  ) {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      const manifest = await this.prefetchUrls();

      if (stopped) {
        return;
      }

      if (!manifest) {
        onProgress(null, []);
        return;
      }

      if (onNewerVersion && !manifest.hasRunningVersion) {
        this.zone.run(onNewerVersion);
        return;
      }

      const { urls } = manifest;

      let pending = await this.missingFromCache(urls);
      const total = scope === "all" ? urls.length : pending.length;

      const report = () => {
        this.zone.run(() => {
          onProgress({ done: total - pending.length, total }, pending);
        });
      };

      report();

      const poll = async () => {
        if (stopped || pending.length === 0) {
          return;
        }

        pending = await this.missingFromCache(pending);

        if (!stopped) {
          report();
          timer = setTimeout(() => void poll(), PROGRESS_POLL_MS);
        }
      };

      // Fora da zona: o timer não deve manter a aplicação "instável"
      this.zone.runOutsideAngular(() => {
        timer = setTimeout(() => void poll(), PROGRESS_POLL_MS);
      });
    };

    void run();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }

  /**
   * O service worker só confere o próprio cache quando começa a rodar: se faltam arquivos
   * (a primeira visita terminou antes do fim do download, ou o navegador apagou parte do
   * cache), eles só voltariam numa visita futura. Pedir cada um passando pelo service
   * worker faz ele baixar e guardar o que falta, porque cada arquivo da lista dele é
   * guardado quando é pedido.
   *
   * Só depois de ele conferir que não há versão nova: senão os arquivos que faltam são da
   * atualização, que ele não guardaria por este caminho e vai baixar de qualquer jeito.
   */
  private refillOfflineCopy() {
    if (this.refilling || !this.latestConfirmed || this.offlineMissing.length === 0) {
      return;
    }

    this.refilling = true;

    const queue = [...this.offlineMissing];

    const worker = async () => {
      for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
        try {
          const response = await fetch(url);
          await response.arrayBuffer();
        } catch {
          // Sem internet: a conferência seguinte mostra o que ainda falta
        }
      }
    };

    this.zone.runOutsideAngular(() => {
      void Promise.all(Array.from({ length: REFILL_CONCURRENCY }, () => worker())).finally(() => {
        this.refilling = false;
      });
    });
  }

  /**
   * Os arquivos dos grupos `prefetch` do `ngsw.json` mais recente, direto do servidor
   * (`ngsw-bypass` faz o service worker não interceptar).
   */
  private async prefetchUrls(): Promise<{ urls: string[]; hasRunningVersion: boolean } | null> {
    try {
      const response = await fetch(`ngsw.json?ngsw-bypass=true&t=${Date.now()}`, { cache: "no-store" });

      if (!response.ok) {
        return null;
      }

      const manifest = (await response.json()) as {
        assetGroups?: Array<{ installMode: string; urls: string[] }>;
        hashTable?: Record<string, string>;
      };

      const urls = manifest.assetGroups?.filter(group => group.installMode === "prefetch").flatMap(group => group.urls);

      if (!urls) {
        return null;
      }

      // O `main-*.js` tem o hash do conteúdo no nome: só a lista da versão aberta o tem
      const main = document.querySelector<HTMLScriptElement>('script[src*="main-"]');
      const mainPath = main ? new URL(main.src).pathname : null;

      return { urls, hasRunningVersion: !mainPath || Object.hasOwn(manifest.hashTable ?? {}, mainPath) };
    } catch {
      return null;
    }
  }

  private async missingFromCache(urls: string[]) {
    const missing: string[] = [];

    for (let i = 0; i < urls.length; i += PROGRESS_BATCH) {
      const batch = urls.slice(i, i + PROGRESS_BATCH);
      const found = await Promise.all(batch.map(url => caches.match(url)));

      for (const [index, response] of found.entries()) {
        if (!response) {
          missing.push(batch[index]);
        }
      }
    }

    return missing;
  }
}
