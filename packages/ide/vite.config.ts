import { copyFile } from "node:fs/promises";
import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

const root = import.meta.dirname;
const nodeModules = path.resolve(root, "../../node_modules");
const outDir = path.resolve(root, "dist/browser");

/**
 * Copia o conteúdo de uma pasta mantendo as subpastas. O `stripBase` numérico remove só os
 * segmentos do caminho de origem (`stripBase: true` achataria tudo numa pasta só).
 */
function copyDir(from: string, dest: string, pattern = "**/*") {
  const relative = path.relative(root, from).split(path.sep);

  return {
    src: `${relative.join("/")}/${pattern}`,
    dest,
    rename: { stripBase: relative.filter(segment => segment !== "..").length },
  };
}

/**
 * O GitHub Pages não tem reescrita de rotas: um `404.html` igual ao `index.html` faz
 * `/ajuda` e `/editor/…` abrirem o IDE mesmo antes do service worker estar instalado.
 */
function spaFallback(): Plugin {
  return {
    name: "pws-spa-fallback",
    apply: "build",
    async closeBundle() {
      await copyFile(path.join(outDir, "index.html"), path.join(outDir, "404.html"));
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 2048,
  },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        // O Monaco é carregado pelo loader AMD a partir daqui, fora do bundle.
        copyDir(`${nodeModules}/monaco-editor/min/vs`, "assets/monaco-editor/min/vs"),
        // Ajuda, exemplos e demais recursos servidos como arquivos estáticos.
        copyDir(`${nodeModules}/@portugol-webstudio/resources/assets`, "assets/recursos"),
        copyDir(`${nodeModules}/@portugol-webstudio/worker/lib`, "assets/portugol-worker", "*.js"),
        // Fonte usada pelas páginas da Ajuda.
        copyDir(`${nodeModules}/@fontsource/pt-sans`, "assets/fonts/pt-sans"),
      ],
    }),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      // O manifesto é estático, em `public/manifest.webmanifest`.
      manifest: false,
      workbox: {
        globPatterns: [
          "index.html",
          "*.{js,css,ico,svg,png,webmanifest}",
          "assets/*.{js,css,svg,png,woff,woff2}",
          "assets/icons/**",
          "assets/logo/**",
          "assets/portugol-worker/**",
          "assets/recursos/**",
        ],
        globIgnores: ["assets/monaco-editor/**", "404.html"],
        maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/assets\//],
        runtimeCaching: [
          {
            // O editor é pesado: só entra no cache quando for usado.
            urlPattern: ({ url }) => url.pathname.startsWith("/assets/monaco-editor/"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "monaco-editor" },
          },
        ],
      },
    }),
    spaFallback(),
  ],
});
