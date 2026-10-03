import { DialogRef } from "@angular/cdk/dialog";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgxGoogleAnalyticsModule } from "ngx-google-analytics";

import { IS_BETA } from "../beta";
import { TooltipDirective } from "../shared/tooltip.directive";

@Component({
  selector: "app-dialog-about",
  imports: [AngularSvgIconModule, NgxGoogleAnalyticsModule, TooltipDirective],
  templateUrl: "./dialog-about.component.html",
  styleUrl: "./dialog-about.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAboutComponent {
  readonly dialogRef = inject<DialogRef<"changelog">>(DialogRef);
  readonly isBeta = IS_BETA;
}
