/**
 * Launch Handler API: os arquivos `.por` que o sistema abre com o app instalado
 * (ver `file_handlers` no `manifest.webmanifest`). Ainda não está nos tipos do
 * TypeScript, e só existe nos navegadores baseados no Chromium.
 */
interface LaunchParams {
  readonly targetURL?: string;
  readonly files: readonly FileSystemHandle[];
}

interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void): void;
}

interface Window {
  readonly launchQueue?: LaunchQueue;
}
