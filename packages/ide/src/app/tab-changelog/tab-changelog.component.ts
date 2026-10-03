import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MarkdownComponent } from "ngx-markdown";

import { CHANGELOG } from "../changelog";

@Component({
  selector: "app-tab-changelog",
  imports: [MarkdownComponent],
  templateUrl: "./tab-changelog.component.html",
  styleUrl: "./tab-changelog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabChangelogComponent {
  readonly changelog = CHANGELOG;
}
