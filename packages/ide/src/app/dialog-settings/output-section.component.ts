import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LocalStorage, LocalStorageService } from "ngx-webstorage";
import { settings } from "../../settings";
import { FontSizeControlComponent } from "./font-size-control.component";

@Component({
  selector: "app-output-section",
  imports: [FormsModule, AngularSvgIconModule, FontSizeControlComponent],
  templateUrl: "./output-section.component.html",
  styleUrls: ["./setting-field.scss", "./output-section.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class OutputSectionComponent {
  private localStorageService = inject(LocalStorageService);

  @LocalStorage(settings.editorFontSize.key, settings.editorFontSize.default)
  editorFontSize!: number;

  @LocalStorage(settings.outputFontSize.key)
  private storedOutputFontSize?: number | null;

  /**
   * Até ser alterado, acompanha o tamanho da fonte do editor.
   */
  get outputFontSize() {
    return this.storedOutputFontSize ?? this.editorFontSize;
  }

  set outputFontSize(value: number) {
    this.storedOutputFontSize = value;
  }

  get followsEditor() {
    return this.storedOutputFontSize === null || this.storedOutputFontSize === undefined;
  }

  @LocalStorage(settings.outputClearOnRun.key, settings.outputClearOnRun.default)
  outputClearOnRun!: boolean;

  @LocalStorage(settings.outputAutoScroll.key, settings.outputAutoScroll.default)
  outputAutoScroll!: boolean;

  @LocalStorage(settings.outputWordWrap.key, settings.outputWordWrap.default)
  outputWordWrap!: boolean;

  @LocalStorage(settings.outputStartCollapsed.key, settings.outputStartCollapsed.default)
  outputStartCollapsed!: boolean;

  @LocalStorage(settings.outputShowExecutionTime.key, settings.outputShowExecutionTime.default)
  outputShowExecutionTime!: boolean;

  followEditor() {
    this.localStorageService.clear(settings.outputFontSize.key);
  }
}
