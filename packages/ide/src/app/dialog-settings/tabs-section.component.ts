import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LocalStorage } from "ngx-webstorage";
import { settings } from "../../settings";
import { MAX_AGE_DAYS, MAX_RECOVERABLE } from "../workspace.service";

@Component({
  selector: "app-tabs-section",
  imports: [FormsModule, MatSlideToggleModule, AngularSvgIconModule],
  standalone: true,
  templateUrl: "./tabs-section.component.html",
  styleUrls: ["./setting-field.scss", "./tabs-section.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TabsSectionComponent {
  protected readonly maxAgeDays = MAX_AGE_DAYS;
  protected readonly maxRecoverable = MAX_RECOVERABLE;

  @LocalStorage(settings.interfaceConfirmCloseTab.key, settings.interfaceConfirmCloseTab.default)
  interfaceConfirmCloseTab!: boolean;

  @LocalStorage(settings.interfaceReopenTabs.key, settings.interfaceReopenTabs.default)
  interfaceReopenTabs!: boolean;
}
