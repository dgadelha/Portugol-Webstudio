import type { editor } from "monaco-editor";
import { useEffect, useRef } from "react";

import { CodeEditor } from "@/components/CodeEditor";
import { useLatest } from "@/hooks/useLatest";
import type { EditorMount } from "@/lib/monaco/types";

interface OutputConsoleProps {
  output: string;
  /**
   * Devolve `true` quando a tecla foi aceita como entrada do programa.
   */
  onInput: (key: string) => boolean;
  onMount?: EditorMount;
}

/**
 * Console do programa: mostra a saída e, quando o programa pede `leia`, captura o teclado.
 */
export function OutputConsole({ output, onInput, onMount }: OutputConsoleProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const onInputRef = useLatest(onInput);

  // A cada nova saída, o cursor vai para o fim: é ali que o usuário digita a entrada.
  useEffect(() => {
    const instance = editorRef.current;
    const model = instance?.getModel();

    if (!instance || !model) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const lastLine = model.getLineCount();

      instance.setPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) });
      instance.setScrollPosition({ scrollLeft: 0, scrollTop: instance.getScrollHeight() });
    });

    if (output) {
      instance.focus();
    }

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [output]);

  return (
    <CodeEditor
      className="pws-output"
      language="plaintext"
      value={output}
      options={{
        readOnly: true,
        lineNumbers: "off",
        minimap: { enabled: false },
        wordWrap: "on",
        guides: { indentation: false },
      }}
      onMount={(instance, monaco) => {
        editorRef.current = instance;

        instance.onKeyDown(event => {
          const { key } = event.browserEvent;

          if (key === "Enter" || event.code === "Enter") {
            onInputRef.current("\r");
          } else if (event.code === "Backspace") {
            onInputRef.current("\b");
          } else if (key.length === 1) {
            onInputRef.current(key);
          }
        });

        onMount?.(instance, monaco);
      }}
    />
  );
}
