import Editor, { type EditorProps } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

import { useMonacoTheme, useSettings } from "@/features/settings/useSettings";
import { registerPortugolLanguage } from "@/lib/monaco/portugolLanguage";

interface CodeEditorProps extends EditorProps {
  /**
   * Aplica o tamanho da fonte e a quebra de linha escolhidos nas configurações.
   */
  userSettings?: boolean;
}

/**
 * Monaco já configurado para o IDE: tema acompanhando a interface, linguagem Portugol registrada
 * e layout automático (o editor pode nascer dentro de uma aba escondida).
 */
export function CodeEditor({ userSettings = true, options, beforeMount, ...props }: CodeEditorProps) {
  const theme = useMonacoTheme();
  const { editorFontSize, editorWordWrap } = useSettings();

  return (
    <Editor
      theme={theme}
      loading={<Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Carregando editor" />}
      beforeMount={monaco => {
        registerPortugolLanguage(monaco);
        beforeMount?.(monaco);
      }}
      options={{
        automaticLayout: true,
        tabSize: 2,
        fontFamily: "'Geist Mono Variable', ui-monospace, monospace",
        fontLigatures: false,
        padding: { top: 12 },
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        ...(userSettings && { fontSize: editorFontSize, wordWrap: editorWordWrap ? "on" : "off" }),
        ...options,
      }}
      {...props}
    />
  );
}
