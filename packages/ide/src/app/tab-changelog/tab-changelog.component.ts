import { ChangeDetectionStrategy, Component } from "@angular/core";

import { CHANGELOG } from "../changelog";

@Component({
  selector: "app-tab-changelog",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./tab-changelog.component.html",
  styleUrl: "./tab-changelog.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TabChangelogComponent {
  readonly changelog = CHANGELOG;
}
