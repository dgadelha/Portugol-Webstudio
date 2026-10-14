import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LocalStorage } from "ngx-webstorage";
import { settings } from "../../settings";

@Component({
  selector: "app-execution-section",
  imports: [FormsModule],
  templateUrl: "./execution-section.component.html",
  styleUrl: "./setting-field.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ExecutionSectionComponent {
  @LocalStorage(settings.executionAdvancedDebugging.key, settings.executionAdvancedDebugging.default)
  executionAdvancedDebugging!: boolean;
}
