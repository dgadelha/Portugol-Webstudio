import { Injectable } from "@angular/core";
import { MonacoEditorLoaderService } from "@materia-ui/ngx-monaco-editor";

/**
 * Carrega o Monaco em português: roda as mensagens (`src/monaco-pt-br.gerado.js`) antes do
 * `loader.js`. Quando o Monaco trouxer o `vs/nls/lang/pt-br.js` preenchido, troque o `import` por
 * um `<script>` com `assets/monaco-editor/min/vs/nls/lang/pt-br.js` e apague o arquivo gerado e o `.d.ts` dele.
 *
 * O arquivo só põe as mensagens no `globalThis`, onde o Monaco as procura. Ele tem de rodar antes
 * de qualquer módulo do Monaco, porque muitos textos (os do menu de contexto, os dos comandos) são
 * calculados quando o módulo carrega. Por isso não serve o jeito do próprio Monaco (o `vs/nls`
 * na configuração do AMD): ele pede o idioma junto com o resto, e o pedaço com o editor, que não
 * espera pelo idioma, pode rodar antes dele.
 *
 * Ele vem por `import()`, e não como asset, para sair num pedaço com hash no nome: o Monaco acha
 * as mensagens pela posição, e uma cópia velha no cache, junto de um Monaco novo, trocaria os
 * textos. Assim o service worker também já o baixa na instalação, para funcionar sem internet.
 *
 * Se o arquivo não carregar (sem internet e fora do cache), o Monaco carrega em inglês.
 */
// eslint-disable-next-line @angular-eslint/prefer-service-decorator -- o `@Service()` não herda a injeção pelo construtor (NG2028)
@Injectable({ providedIn: "root" })
export class MonacoLoaderService extends MonacoEditorLoaderService {
  override loadMonaco(): void {
    import("../monaco-pt-br.gerado.js")
      .catch(() => {
        // Sem as mensagens, o Monaco carrega em inglês
      })
      .finally(() => {
        super.loadMonaco();
      });
  }
}
