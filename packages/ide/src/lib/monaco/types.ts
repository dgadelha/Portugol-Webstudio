import type * as MonacoApi from "monaco-editor";

/**
 * A API do Monaco. O tipo `Monaco` do `@monaco-editor/react` aponta para um subcaminho que o
 * `monaco-editor` não exporta mais e vira `any`; este vem do pacote direto e é checado.
 */
export type Monaco = typeof MonacoApi;

/**
 * Callback de quando o editor monta, com a API do Monaco tipada (ver `Monaco`).
 */
export type EditorMount = (editor: MonacoApi.editor.IStandaloneCodeEditor, monaco: Monaco) => void;
