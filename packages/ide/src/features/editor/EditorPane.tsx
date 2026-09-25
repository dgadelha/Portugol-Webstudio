import type { EditorMount, Monaco } from "@/lib/monaco/types";
import type { IPortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { CodeEditor } from "@/components/CodeEditor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/Resizable";
import { useSidebarSlot } from "@/features/workspace/sidebarSlotContext";
import { useTab, useWorkspaceStore } from "@/features/workspace/useWorkspace";
import { useWorkspaceActions } from "@/features/workspace/workspaceActionsContext";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useLatest } from "@/hooks/useLatest";
import { trackEvent } from "@/lib/analytics";
import { downloadPortugolFile, openPortugolFileInNewTab, savePortugolFileWithPicker } from "@/lib/files";
import { portugolWorker } from "@/lib/portugolWorker";
import { shareCode } from "@/lib/share";

import { EditorSidebarActions } from "./components/EditorSidebarActions";
import { GraphicsWindow } from "./components/GraphicsWindow";
import { OUTPUT_HEADER_HEIGHT, OutputPanel } from "./components/OutputPanel";
import { useCollapsiblePanel } from "./hooks/useCollapsiblePanel";
import { showShareToast } from "./lib/shareToast";
import { useGraphicsWindow } from "./hooks/useGraphicsWindow";
import { usePortugolRunner } from "./hooks/usePortugolRunner";
import { applyDiagnostics } from "./lib/diagnostics";
import styles from "./EditorPane.module.css";

/**
 * Silêncio de digitação antes de checar o código de novo.
 */
const LIVE_CHECK_DEBOUNCE = 500;

interface EditorPaneProps {
  tabId: string;
  /**
   * Só a aba em foco responde aos atalhos de teclado.
   */
  active: boolean;
}

export function EditorPane({ tabId, active }: EditorPaneProps) {
  const store = useWorkspaceStore();
  const tab = useTab(tabId);
  const title = tab?.title ?? "";
  const { openHelp, openFilesFromDisk } = useWorkspaceActions();
  const { slot: sidebarSlot } = useSidebarSlot();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const liveCheckTimer = useRef<number | undefined>(undefined);
  const [sharing, setSharing] = useState(false);
  // A saída começa recolhida e só abre sozinha ao executar; fora isso vale o que o usuário escolher.
  const outputPanel = useCollapsiblePanel({ collapsedSize: OUTPUT_HEADER_HEIGHT, defaultOpenSize: "30%" });

  const code = useCallback(() => store.getContents(tabId), [store, tabId]);

  const setDiagnostics = useCallback((diagnostics: IPortugolCodeDiagnostic[]) => {
    const model = editorRef.current?.getModel();

    if (model && monacoRef.current) {
      applyDiagnostics(monacoRef.current, model, diagnostics);
    }
  }, []);

  const runner = usePortugolRunner({
    onDiagnostics: setDiagnostics,
    onFinish: () => {
      graphicsRef.current.dismiss();
    },
    onMessage: async message => {
      if (message.type.startsWith("graphics.")) {
        await graphicsRef.current.renderer.handleMessage(message);
      }
    },
  });

  const graphics = useGraphicsWindow(runner.executor, runner.stop);
  // A janela gráfica depende do executor e o executor avisa a janela quando termina: os
  // callbacks acima chegam a ela por esta referência.
  const graphicsRef = useLatest(graphics);

  useEffect(() => {
    return () => {
      clearTimeout(liveCheckTimer.current);
    };
  }, []);

  // --- Ações -----------------------------------------------------------------------------

  const actions = {
    run: () => {
      if (runner.busy) return;

      outputPanel.expand();
      void runner.run(code());
    },

    save: () => {
      trackEvent("editor_save_file", "editor", "Botão de Salvar arquivo");
      void downloadPortugolFile(code(), title);
    },

    download: (compat: boolean) => {
      void downloadPortugolFile(code(), title, compat);
    },

    saveWithPicker: async () => {
      try {
        if (await savePortugolFileWithPicker(code(), title)) {
          toast.success("Arquivo salvo com sucesso!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Ocorreu um erro ao salvar o arquivo!");
      }
    },

    openInNewTab: (as: "text" | "binary") => {
      void openPortugolFileInNewTab(code(), title, as);
    },

    help: () => {
      trackEvent("editor_help_tab_open", "Editor", "Nova aba de ajuda através do Editor");
      openHelp();
    },

    share: async () => {
      const contents = code();

      if (!contents) {
        return;
      }

      setSharing(true);

      const url = await shareCode(contents);

      if (url) {
        showShareToast(url);
        trackEvent("share_code_success", "Editor", "Código compartilhado com sucesso");
      } else {
        toast.error("Não foi possível compartilhar o código. Tente novamente mais tarde.");
        trackEvent("share_code_error", "Editor", "Erro ao compartilhar código");
      }

      setSharing(false);
    },
  };

  const actionsRef = useLatest(actions);

  useHotkeys(
    {
      f1: () => {
        actionsRef.current.help();
      },
      "mod+s": () => {
        actionsRef.current.save();
      },
      "mod+enter": () => {
        actionsRef.current.run();
      },
    },
    active,
  );

  /**
   * Os mesmos atalhos dentro do Monaco, que captura o teclado quando está em foco.
   */
  const registerEditorActions: EditorMount = (instance, monaco) => {
    const bind = (id: string, label: string, keybinding: number, run: () => void) => {
      instance.addAction({ id, label, keybindings: [keybinding], run });
    };

    bind("runCode", "Executar código", monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      actionsRef.current.run();
    });
    bind("saveFile", "Salvar arquivo", monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      actionsRef.current.save();
    });
    bind("openFile", "Abrir arquivo", monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, openFilesFromDisk);
    bind("openHelp", "Ajuda", monaco.KeyCode.F1, () => {
      actionsRef.current.help();
    });
  };

  const onCodeEditorMount: EditorMount = (instance, monaco) => {
    editorRef.current = instance;
    monacoRef.current = monaco;
    registerEditorActions(instance, monaco);

    // Checagem ao vivo: marca erros e avisos pouco depois que o usuário para de digitar.
    instance.onDidChangeModelContent(() => {
      clearTimeout(liveCheckTimer.current);

      liveCheckTimer.current = window.setTimeout(() => {
        portugolWorker
          .checkCode(code())
          .then(result => {
            setDiagnostics([...result.diagnostics, ...result.parseErrors]);
          })
          .catch((error: unknown) => {
            console.error(error);
          });
      }, LIVE_CHECK_DEBOUNCE);
    });
  };

  return (
    <div className={styles.pane}>
      <ResizablePanelGroup orientation="vertical" className={styles.panels}>
        <ResizablePanel minSize="15%">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel minSize="25%">
              <CodeEditor
                path={`file:///${tabId}.por`}
                language="portugol"
                defaultValue={code()}
                options={{ tabCompletion: "on" }}
                onChange={value => {
                  store.setContents(tabId, value ?? "");
                }}
                onMount={onCodeEditorMount}
              />
            </ResizablePanel>

            {/* Divisória invisível até o hover ou o arrasto. */}
            <ResizableHandle className={styles.hiddenHandle} />

            {/* Código JavaScript gerado: fechado, aparece ao arrastar a divisória da direita. */}
            <ResizablePanel defaultSize={0} collapsible collapsedSize={0} minSize="15%">
              <GeneratedCodeView code={runner.byteCode} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel
          panelRef={outputPanel.panelRef}
          collapsible
          collapsedSize={OUTPUT_HEADER_HEIGHT}
          defaultSize={OUTPUT_HEADER_HEIGHT}
          minSize="15%"
          onResize={outputPanel.onResize}
        >
          <OutputPanel
            output={runner.output}
            running={runner.running}
            waitingForInput={runner.waitingForInput}
            collapsed={outputPanel.collapsed}
            onToggle={outputPanel.toggle}
            onInput={runner.sendInput}
            onClear={runner.clearOutput}
            onConsoleMount={registerEditorActions}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Só a aba em foco ocupa a sidebar com as suas ações. */}
      {active &&
        sidebarSlot &&
        createPortal(
          <EditorSidebarActions
            running={runner.running}
            transpiling={runner.transpiling}
            sharing={sharing}
            onRun={actions.run}
            onStop={runner.stop}
            onSave={actions.save}
            onSaveWithPicker={() => void actions.saveWithPicker()}
            onDownload={actions.download}
            onOpenInNewTab={actions.openInNewTab}
            onOpenFile={openFilesFromDisk}
            onShare={() => void actions.share()}
          />,
          sidebarSlot,
        )}

      {graphics.windowState && (
        <GraphicsWindow title={graphics.windowState.title} canvasRef={graphics.canvasRef} onClose={graphics.close} />
      )}
    </div>
  );
}

function GeneratedCodeView({ code }: { code: string }) {
  return (
    <div className={styles.pane}>
      <div className={styles.generatedHeader}>JavaScript gerado</div>
      <div className={styles.fill}>
        {code ? (
          <CodeEditor
            language="javascript"
            value={code}
            options={{ readOnly: true, lineNumbers: "off", minimap: { enabled: false } }}
          />
        ) : (
          <p className={styles.generatedEmpty}>Execute o programa para ver o código gerado.</p>
        )}
      </div>
    </div>
  );
}
