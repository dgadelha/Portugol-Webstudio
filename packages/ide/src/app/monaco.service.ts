import { Injectable } from "@angular/core";
import { MonacoEditorLoaderService } from "@materia-ui/ngx-monaco-editor";
import {
  PortugolCodeCompletionProvider,
  PortugolLanguageConfiguration,
  PortugolLanguageExtensionPoint,
  PortugolMonarchLanguage,
} from "@portugol-webstudio/monaco";
import { filter, take } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class MonacoService {
  constructor(private monacoLoaderService: MonacoEditorLoaderService) {
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => isLoaded),
        take(1),
      )
      .subscribe(() => {
        try {
          monaco.languages.register(PortugolLanguageExtensionPoint as monaco.languages.ILanguageExtensionPoint);
          monaco.languages.setLanguageConfiguration("portugol", PortugolLanguageConfiguration);
          monaco.languages.setMonarchTokensProvider(
            "portugol",
            PortugolMonarchLanguage as monaco.languages.IMonarchLanguage,
          );

          monaco.languages.registerCompletionItemProvider(
            "portugol",
            new PortugolCodeCompletionProvider() as monaco.languages.CompletionItemProvider,
          );

          monaco.editor.defineTheme("portugol-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "functions", foreground: "F5D7A9" },
              { token: "string.escape", foreground: "D2BB85" },
              { token: "string.escape.invalid", foreground: "DF5953" },
            ],
            colors: {},
          });

          monaco.editor.defineTheme("portugol-light", {
            base: "vs",
            inherit: true,
            rules: [
              { token: "functions", foreground: "AD7F00" },
              { token: "string.escape", foreground: "DC009E" },
              { token: "string.escape.invalid", foreground: "DF5953" },
            ],
            colors: {},
          });
        } catch (error) {
          console.error(error);
          window.location.reload();
        }
      });
  }
}
