import { inject, NgZone, Service } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { interval } from "rxjs";
import { NewVersionAvailableComponent } from "./new-version-available/new-version-available.component";

@Service()
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private toast = inject(HotToastService);
  private zone = inject(NgZone);

  loadingToast?: CreateHotToastRef<unknown>;
  versionReadyToast?: CreateHotToastRef<unknown>;

  /**
   * Versão sendo baixada. O service worker avisa de novo a cada verificação que acontece
   * durante o download (a de cada navegação, a de outras abas, a periódica), porque a
   * versão só conta como conhecida quando termina de baixar.
   */
  private downloadingHash?: string;
  private readyHash?: string;

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates.subscribe(event => {
      console.log("PWA:", event);

      switch (event.type) {
        case "VERSION_DETECTED": {
          const { hash } = event.version;

          if (hash === this.downloadingHash || hash === this.readyHash) {
            break;
          }

          this.downloadingHash = hash;
          this.loadingToast?.close();

          this.loadingToast = this.toast.loading("Baixando atualizações…", {
            autoClose: false,
            dismissible: true,
          });

          break;
        }

        case "VERSION_READY": {
          const { hash } = event.latestVersion;

          this.downloadingHash = undefined;
          this.loadingToast?.close();

          if (hash === this.readyHash) {
            break;
          }

          this.readyHash = hash;
          this.versionReadyToast?.close();

          this.versionReadyToast = this.toast.success(NewVersionAvailableComponent, {
            autoClose: false,
            dismissible: true,
          });

          break;
        }

        case "VERSION_INSTALLATION_FAILED": {
          console.error("PWA: falha ao instalar a atualização", event.error);

          // A próxima verificação tenta de novo, e mostra o aviso de novo
          this.downloadingHash = undefined;
          this.loadingToast?.close();
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
}
