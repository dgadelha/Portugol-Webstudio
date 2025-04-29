import { Injectable } from "@angular/core";
import { MonacoEditorLoaderService } from "@materia-ui/ngx-monaco-editor";
import { filter, take } from "rxjs/operators";

// Importação dos módulos modularizados
import { registerPortugolLanguage } from "./monaco/portugol-language-definition";
import { registerMonacoThemes } from "./monaco/monaco-themes";
import { MonacoErrorHandler } from "./monaco/monaco-error-handler";

/**
 * Serviço responsável por inicializar e configurar o Monaco Editor
 * para trabalhar com a linguagem Portugol
 */
@Injectable({ providedIn: "root" })
export class MonacoService {
  // Instanciando o errorHandler diretamente
  private errorHandler = new MonacoErrorHandler();
  
  constructor(private monacoLoaderService: MonacoEditorLoaderService) {
    this.initializeMonaco();
  }

  /**
   * Inicializa o Monaco Editor quando estiver carregado
   */
  private initializeMonaco(): void {
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => isLoaded),
        take(1),
      )
      .subscribe(() => {
        try {
          // Registra a linguagem Portugol
          registerPortugolLanguage();
          
          // Registra os temas do Monaco
          registerMonacoThemes();
          
          // Log de sucesso
          console.log("Monaco Editor inicializado com sucesso para Portugol");
        } catch (error) {
          // Usa o tratador de erros para lidar com o problema
          const errorHandled = this.errorHandler.handleInitializationError(error as Error);
          
          // Se o erro não foi tratado com sucesso, recorre à recarga da página
          // como último recurso, mas apenas após notificar o usuário
          if (!errorHandled) {
            console.error("Falha ao inicializar o Monaco Editor. Recarregando a página...");
            setTimeout(() => window.location.reload(), 3000); // Dá tempo para o usuário ver mensagens de erro
          }
        }
      });
  }
}
