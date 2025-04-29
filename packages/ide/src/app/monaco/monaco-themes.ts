/**
 * Definições de temas para o Monaco Editor
 */

// Declaração para acessar a variável global monaco
declare const monaco: any;

/**
 * Registra os temas do Portugol no Monaco Editor
 */
export function registerMonacoThemes(): void {
  // Tema escuro para o Portugol
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

  // Tema claro para o Portugol
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
}
