import { Signal } from "@angular/core";

/**
 * - `unsupported`: sem service worker (navegador sem suporte, ou ambiente local)
 * - `checking`: conferindo no cache se todos os arquivos já foram baixados
 * - `downloading`: baixando os arquivos para usar sem internet
 * - `ready`: o IDE abre sem internet
 * - `unknown`: não deu para ler a lista de arquivos e conferir o cache
 */
export type OfflineStatus = "unsupported" | "checking" | "downloading" | "ready" | "unknown";

/**
 * - `checking`: verificação pedida no Sobre, ainda sem resposta
 * - `latest`: a verificação não achou versão nova
 * - `offline`: sem internet para verificar
 */
export type UpdateStatus = "idle" | "checking" | "latest" | "offline" | "downloading" | "ready" | "failed";

/**
 * Arquivos já baixados de um total. `null` quando não dá para saber, e aí aparece uma
 * barra sem porcentagem.
 */
export interface DownloadProgress {
  done: number;
  total: number;
}

/**
 * O que o aviso de download de uma atualização recebe: o progresso, que ele acompanha.
 */
export interface DownloadToastData {
  progress: Signal<DownloadProgress | null>;
}
