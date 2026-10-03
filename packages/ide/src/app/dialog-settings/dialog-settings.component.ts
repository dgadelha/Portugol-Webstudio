import { NgComponentOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, signal, Type } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogClose, MatDialogTitle } from "@angular/material/dialog";
import { AngularSvgIconModule } from "angular-svg-icon";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { LocalStorageService } from "ngx-webstorage";
import { debounceTime, filter, map, merge } from "rxjs";
import { settings } from "../../settings";
import { AppearanceSectionComponent } from "./appearance-section.component";
import { EditorSectionComponent } from "./editor-section.component";
import { OutputSectionComponent } from "./output-section.component";
import { TabsSectionComponent } from "./tabs-section.component";

type SectionId = "appearance" | "editor" | "output" | "tabs";

const SECTIONS: Array<{ id: SectionId; label: string; description: string; icon: string; component: Type<unknown> }> = [
  {
    id: "appearance",
    label: "Aparência",
    description: "Tema da interface e do editor.",
    icon: "assets/mdi/palette-outline.svg",
    component: AppearanceSectionComponent,
  },
  {
    id: "editor",
    label: "Editor",
    description: "Como o código aparece enquanto você escreve.",
    icon: "assets/mdi/code-tags.svg",
    component: EditorSectionComponent,
  },
  {
    id: "output",
    label: "Saída",
    description: "O que o programa escreve enquanto executa.",
    icon: "assets/mdi/console.svg",
    component: OutputSectionComponent,
  },
  {
    id: "tabs",
    label: "Abas",
    description: "O que acontece ao fechar uma aba e ao abrir uma janela nova.",
    icon: "assets/mdi/tab.svg",
    component: TabsSectionComponent,
  },
];

/**
 * Preferências do usuário, organizadas em seções. As mudanças valem na hora e
 * ficam salvas neste navegador.
 */
@Component({
  selector: "app-dialog-settings",
  imports: [NgComponentOutlet, MatButtonModule, MatDialogClose, MatDialogTitle, AngularSvgIconModule],
  standalone: true,
  templateUrl: "./dialog-settings.component.html",
  styleUrl: "./dialog-settings.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class DialogSettingsComponent {
  private localStorageService = inject(LocalStorageService);
  private gaService = inject(GoogleAnalyticsService);

  protected readonly sections = SECTIONS;
  protected readonly sectionId = signal<SectionId>("appearance");
  protected readonly section = computed(() => SECTIONS.find(item => item.id === this.sectionId()) ?? SECTIONS[0]);

  constructor() {
    // Uma espera por configuração, para o controle deslizante não registrar
    // cada passo do arraste. O `takeUntilDestroyed` vem antes do
    // `debounceTime` para que uma mudança feita logo antes de fechar o diálogo
    // ainda seja registrada.
    merge(
      ...Object.values(settings).map(({ key }) =>
        this.localStorageService.observe(key).pipe(
          takeUntilDestroyed(),
          // "Restaurar padrões" apaga as chaves e é registrado à parte.
          filter(value => value !== null && value !== undefined),
          debounceTime(1000),
          map(value => `${key}=${String(value)}`),
        ),
      ),
    ).subscribe(label => {
      this.gaService.event("settings_change", "Configurações", label);
    });
  }

  resetDefaults() {
    this.gaService.event("settings_reset", "Configurações", "Restaurar padrões");

    // `clear()` do ngx-webstorage apaga o `localStorage` inteiro, inclusive o
    // código que o usuário está editando: aqui só as configurações voltam ao
    // padrão.
    for (const { key } of Object.values(settings)) {
      this.localStorageService.clear(key);
    }
  }
}
