import { inject, Injectable } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { interval } from "rxjs";
import { NewVersionAvailableComponent } from "./new-version-available/new-version-available.component";

@Injectable({ providedIn: "root" })
export class PwaService {
  loadingToast?: CreateHotToastRef<unknown>;
  versionReadyToast?: CreateHotToastRef<unknown>;

  private swUpdate = inject(SwUpdate);
  private toast = inject(HotToastService);

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates.subscribe(event => {
      console.log("PWA:", event);

      switch (event.type) {
        case "VERSION_DETECTED": {
          this.loadingToast?.close();
          this.versionReadyToast?.close();

          this.loadingToast = this.toast.loading("Baixando atualizações…", {
            autoClose: true,
            duration: 5000,
          });

          break;
        }

        case "VERSION_READY": {
          this.loadingToast?.close();
          this.versionReadyToast?.close();

          this.versionReadyToast = this.toast.success(NewVersionAvailableComponent, {
            autoClose: false,
            dismissible: true,
          });

          break;
        }

        default: {
          break;
        }
      }
    });

    this.swUpdate.checkForUpdate().catch(() => {});

    interval(/* 30 min */ 30 * 60 * 1000).subscribe(() => {
      this.swUpdate.checkForUpdate().catch(() => {});
    });
  }
}
