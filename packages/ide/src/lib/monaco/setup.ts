import { loader } from "@monaco-editor/react";

import { registerPortugolLanguage } from "./portugolLanguage";

/**
 * O Monaco é servido como arquivos estáticos (ver `vite.config.ts`) e carregado pelo loader AMD,
 * fora do bundle principal: o service worker só o baixa quando o editor é usado.
 */
export function setupMonaco() {
  loader.config({ paths: { vs: "/assets/monaco-editor/min/vs" } });

  // Começa a baixar o editor enquanto o usuário ainda está na aba inicial.
  loader
    .init()
    .then(monaco => {
      registerPortugolLanguage(monaco);

      // A Geist Mono é uma webfont: quando termina de carregar, o Monaco precisa medir de novo
      // a largura dos caracteres, ou o cursor fica desalinhado.
      void document.fonts.ready.then(() => {
        monaco.editor.remeasureFonts();
      });
    })
    .catch((error: unknown) => {
      console.error(error);
    });
}
