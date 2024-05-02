import { Injectable } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { NewVersionAvailableComponent } from "./new-version-available/new-version-available.component";

@Injectable({ providedIn: "root" })
export class PwaService {
  loadingToast?: CreateHotToastRef<unknown>;

  constructor(
    private swUpdate: SwUpdate,
    private toast: HotToastService,
  ) {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates.subscribe(event => {
      switch (event.type) {
        case "VERSION_DETECTED": {
          this.loadingToast = this.toast.loading("Baixando atualizações…", {
            autoClose: true,
            duration: 5000,
          });

          break;
        }

        case "VERSION_READY": {
          this.loadingToast?.close();
          this.toast.success(NewVersionAvailableComponent, {
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
  }
}
