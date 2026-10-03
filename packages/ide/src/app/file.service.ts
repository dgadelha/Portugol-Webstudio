import { Service } from "@angular/core";

/**
 * Decodifica UTF-8 e recusa sequências inválidas, em vez de trocá-las por "�".
 */
const UTF8 = new TextDecoder("utf-8", { fatal: true });

/**
 * O Portugol Studio salva os arquivos em ISO-8859-1. O `windows-1252` cobre o
 * ISO-8859-1 e também os caracteres que o Windows acrescenta a ele.
 */
const LATIN1 = new TextDecoder("windows-1252");

@Service()
export class FileService {
  /**
   * Lê um arquivo de código. Um arquivo que é UTF-8 válido é lido como UTF-8;
   * qualquer outro, como os do Portugol Studio, como Latin-1. Detectar a
   * codificação por estatística confundia os acentos do Latin-1 com letras
   * cirílicas ("Olб" em vez de "Olá").
   */
  async getContents(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer());

    try {
      return UTF8.decode(bytes);
    } catch {
      return LATIN1.decode(bytes);
    }
  }
}
