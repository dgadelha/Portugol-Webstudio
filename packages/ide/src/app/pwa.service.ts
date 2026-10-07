import { inject, Injector, NgZone, Service, signal } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { GoogleAnalyticsService } from "ngx-google-analytics";
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

/**
 * Quanto o Sobre espera a resposta do service worker (versão nova ou não) antes de mostrar
 * como download os arquivos que faltam. Ele verifica entre 5 e 30 segundos depois de a
 * página carregar.
 */
const OFFLINE_VERDICT_TIMEOUT_MS = 45_000;

@Service()
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private toast = inject(HotToastService);
  private gaService = inject(GoogleAnalyticsService);
  private zone = inject(NgZone);
  private injector = inject(Injector);

  readonly offlineStatus = signal<OfflineStatus>("unsupported");
  readonly offlineProgress = signal<DownloadProgress | null>(null);

  readonly updateStatus = signal<UpdateStatus>("idle");
  readonly updateProgress = signal<DownloadProgress | null>(null);

  readonly online = signal(navigator.onLine);

  loadingToast?: CreateHotToastRef<unknown>;
  versionReadyToast?: CreateHotToastRef<unknown>;

  /**
   * Primeira visita em que faltavam arquivos: quando a cópia offline fica completa, um
   * aviso diz que o IDE já funciona sem internet. O download em si não tem aviso (o
   * progresso fica no Sobre), para não aparecer sem a pessoa ter pedido nada.
   */
  private announceOfflineReady = false;

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

  /**
   * Visita com service worker: faltar arquivo pode ser cópia incompleta ou atualização
   * publicada (aí a lista do servidor é a da versão nova). Quem decide é a resposta do
   * service worker à verificação dele depois de carregar a página.
   */
  private returningVisit = false;
  private offlineVerdictTimer?: ReturnType<typeof setTimeout>;

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
            data: { progress: this.updateProgress },
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

          this.updateReturningOfflineStatus();
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
          this.gaService.event("pwa_update", "PWA", "mostrado");

          this.versionReadyToast = this.toast.success(NewVersionAvailableComponent, {
            data: {
              reload: () => {
                this.reloadToUpdate("aviso");
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
          this.gaService.event("pwa_update", "PWA", "falhou");
          break;
        }

        case "NO_NEW_VERSION_DETECTED": {
          // Uma versão já pronta continua pronta: a verificação só não achou outra
          if (this.updateStatus() === "checking") {
            this.updateStatus.set("latest");
          }

          this.latestConfirmed = true;
          this.updateReturningOfflineStatus();

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
      this.gaService.event("pwa_update", "PWA", "irrecuperavel");

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
   * acaba de baixar; enquanto isso, os eventos atualizam o `updateStatus`. Devolve o resultado,
   * ou `undefined` quando não verificou (sem service worker, ou já baixando).
   */
  async checkForUpdate(): Promise<UpdateStatus | undefined> {
    if (!this.swUpdate.isEnabled || this.updateStatus() === "downloading") {
      return undefined;
    }

    if (!this.online()) {
      this.updateStatus.set("offline");
      return "offline";
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

    return this.updateStatus();
  }

  /**
   * O código das abas fica guardado no navegador e volta igual depois de recarregar, então
   * só pergunta antes quando o navegador não está guardando nada. A área de trabalho é
   * buscada aqui, e não injetada, para o serviço (criado na inicialização) não carregá-la antes.
   */
  /**
   * Pelo botão Atualizar do aviso de versão nova (`aviso`) ou do Sobre (`sobre`).
   */
  reloadToUpdate(origin: "aviso" | "sobre") {
    this.gaService.event("pwa_update", "PWA", `atualizar_${origin}`);

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
   * cache foi apagado): o progresso fica no Sobre, e um aviso diz quando termina. Com
   * service worker, a conferência é calada: quem fechou a aba antes do fim da primeira
   * visita ainda não tem tudo, e o Sobre não deve dizer que está pronto. Um recarregamento
   * forçado (Shift) também abre sem service worker, mas aí o cache já está completo na
   * primeira conferência, e nada é avisado.
   *
   * Com uma atualização publicada, a lista do servidor é a da versão nova, e os arquivos
   * dela faltam no cache até ela ser baixada; a página nem sabe qual é a versão dela (com
   * `navigationRequestStrategy: "freshness"`, o `index.html` e o `main-*.js` novos vêm da
   * rede). Por isso, numa visita com service worker em que faltam arquivos, o Sobre fica
   * em "Conferindo…" até o service worker responder (ver `updateReturningOfflineStatus`).
   */
  private watchOfflineCopy() {
    if (!("caches" in window)) {
      return;
    }

    const returning = Boolean(navigator.serviceWorker.controller);

    this.returningVisit = returning;
    this.offlineStatus.set("checking");

    this.trackDownload("all", (progress, pending) => {
      if (!progress) {
        // Sem a lista, não dá para conferir. Quem volta com service worker está com o IDE
        // aberto pelo cache (sem internet, a lista não chega); na primeira visita, não se sabe.
        this.offlineStatus.set(returning ? "ready" : "unknown");
        return;
      }

      if (progress.done < progress.total) {
        this.offlineProgress.set(progress);

        if (returning) {
          this.offlineMissing = pending;
          this.updateReturningOfflineStatus();
        } else {
          this.offlineStatus.set("downloading");
          this.announceOfflineReady = true;
        }

        return;
      }

      this.offlineStatus.set("ready");
      this.offlineMissing = [];
      clearTimeout(this.offlineVerdictTimer);

      if (this.announceOfflineReady) {
        this.announceOfflineReady = false;
        this.gaService.event("pwa_offline_ready", "PWA", "primeira_visita");

        this.toast.success("O Portugol Webstudio já pode ser usado sem internet.", {
          duration: 8000,
          dismissible: true,
        });
      }
    });
  }

  /**
   * Numa visita com service worker em que faltam arquivos:
   * - com uma atualização sendo baixada (ou pronta), a lista do servidor é a dela: a versão
   *   aberta está guardada, e o progresso aparece na linha da atualização;
   * - se o service worker conferiu que não há versão nova, os arquivos faltam mesmo: a
   *   página os pede (`refillOfflineCopy`) e o Sobre mostra o download;
   * - sem resposta ainda, fica em "Conferindo…"; se ela não vier (servidor fora do ar, por
   *   exemplo), mostra o download depois de um tempo.
   */
  private updateReturningOfflineStatus() {
    if (!this.returningVisit || this.offlineMissing.length === 0) {
      return;
    }

    if (this.downloadingHash || this.readyHash) {
      this.offlineStatus.set("ready");
      return;
    }

    if (this.latestConfirmed) {
      clearTimeout(this.offlineVerdictTimer);
      this.offlineStatus.set("downloading");
      this.refillOfflineCopy();
      return;
    }

    this.offlineStatus.set("checking");

    this.offlineVerdictTimer ??= this.zone.runOutsideAngular(() => {
      return setTimeout(() => {
        this.zone.run(() => {
          if (this.offlineStatus() === "checking" && this.offlineMissing.length > 0) {
            this.offlineStatus.set("downloading");
          }
        });
      }, OFFLINE_VERDICT_TIMEOUT_MS);
    });
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
  ) {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      const urls = await this.prefetchUrls();

      if (stopped) {
        return;
      }

      if (!urls) {
        onProgress(null, []);
        return;
      }

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
  private async prefetchUrls(): Promise<string[] | null> {
    try {
      const response = await fetch(`ngsw.json?ngsw-bypass=true&t=${Date.now()}`, { cache: "no-store" });

      if (!response.ok) {
        return null;
      }

      const manifest = (await response.json()) as { assetGroups?: Array<{ installMode: string; urls: string[] }> };

      return (
        manifest.assetGroups?.filter(group => group.installMode === "prefetch").flatMap(group => group.urls) ?? null
      );
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
