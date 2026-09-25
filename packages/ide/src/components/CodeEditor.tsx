import Editor, { type EditorProps } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import type { editor } from "monaco-editor";

import { outputFontSize, type Settings } from "@/features/settings/settingsStore";
import { useMonacoTheme, useSettings } from "@/features/settings/useSettings";
import { registerPortugolLanguage } from "@/lib/monaco/portugolLanguage";
import { cn } from "@/lib/utils";

import styles from "./CodeEditor.module.css";

/**
 * Quais configurações do usuário o editor segue:
 * - `code`: todas as do editor, para o código que se escreve;
 * - `view`: só o tamanho da fonte e a quebra de linha, para código apenas exibido;
 * - `output`: o tamanho da fonte da saída;
 * - `false`: nenhuma.
 */
export type EditorSettingsProfile = "code" | "view" | "output" | false;

// As cores dos pares são uma opção do modelo de texto, e o Monaco só repassa ao modelo as chaves
// registradas na configuração: `bracketPairColorization` não é uma delas, só
// `bracketPairColorization.enabled`.
type EditorOptions = editor.IStandaloneEditorConstructionOptions & { "bracketPairColorization.enabled"?: boolean };

function settingsOptions(profile: EditorSettingsProfile, settings: Settings): EditorOptions {
  switch (profile) {
    case "code": {
      return {
        fontSize: settings.editorFontSize,
        wordWrap: settings.editorWordWrap ? "on" : "off",
        // No Monaco, `tabSize` e `insertSpaces` valem para todos os editores da página: só o editor
        // de código os define.
        tabSize: settings.editorTabSize,
        insertSpaces: settings.editorInsertSpaces,
        // Com a detecção, um arquivo já indentado ignoraria o tamanho da tabulação escolhido.
        detectIndentation: false,
        lineNumbers: settings.editorLineNumbers,
        minimap: { enabled: settings.editorMinimap },
        "bracketPairColorization.enabled": settings.editorBracketPairColorization,
        guides: { indentation: settings.editorIndentationGuides },
        renderWhitespace: settings.editorRenderWhitespace,
        autoClosingBrackets: settings.editorAutoClosing ? "languageDefined" : "never",
        autoClosingQuotes: settings.editorAutoClosing ? "languageDefined" : "never",
        cursorStyle: settings.editorCursorStyle,
      };
    }

    case "view": {
      return { fontSize: settings.editorFontSize, wordWrap: settings.editorWordWrap ? "on" : "off" };
    }

    case "output": {
      return { fontSize: outputFontSize(settings) };
    }

    default: {
      return {};
    }
  }
}

interface CodeEditorProps extends EditorProps {
  userSettings?: EditorSettingsProfile;
}

/**
 * Monaco já configurado para o IDE: tema acompanhando a interface, linguagem Portugol registrada
 * e layout automático (o editor pode nascer dentro de uma aba escondida).
 */
export function CodeEditor({ userSettings = "view", options, beforeMount, ...props }: CodeEditorProps) {
  const theme = useMonacoTheme();
  const settings = useSettings();

  return (
    <Editor
      theme={theme}
      loading={<Loader2 className={cn(styles.loading, "spin")} aria-label="Carregando editor" />}
      beforeMount={monaco => {
        registerPortugolLanguage(monaco);
        beforeMount?.(monaco);
      }}
      options={{
        automaticLayout: true,
        fontFamily: "'Geist Mono Variable', ui-monospace, monospace",
        fontLigatures: false,
        padding: { top: 12 },
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        ...settingsOptions(userSettings, settings),
        ...options,
      }}
      {...props}
    />
  );
}
