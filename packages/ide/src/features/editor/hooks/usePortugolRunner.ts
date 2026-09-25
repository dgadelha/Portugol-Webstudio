import type { IPortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import { PortugolExecutor, type PortugolMessage, PortugolWebWorkersRunner } from "@portugol-webstudio/runner";
import { captureException, setExtra } from "@sentry/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { LINKS } from "@/config/env";
import { useSettings } from "@/features/settings/useSettings";
import { useLatest } from "@/hooks/useLatest";
import { trackEvent } from "@/lib/analytics";
import { portugolWorker } from "@/lib/portugolWorker";

interface UsePortugolRunnerOptions {
  /**
   * Chamado quando o programa termina (ou é interrompido).
   */
  onFinish?: () => void;
  /**
   * Mensagens que o programa envia para a interface (a biblioteca Graficos, por exemplo).
   */
  onMessage?: (message: PortugolMessage) => Promise<void> | void;
  /**
   * Erros e avisos da checagem feita antes de executar.
   */
  onDiagnostics?: (diagnostics: IPortugolCodeDiagnostic[]) => void;
}

/**
 * Executa código Portugol: transpila no worker, roda no runner e expõe a saída e o estado da
 * execução para a interface.
 */
export function usePortugolRunner(options: UsePortugolRunnerOptions = {}) {
  const [executor] = useState(() => new PortugolExecutor(PortugolWebWorkersRunner));
  const [running, setRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [transpiling, setTranspiling] = useState(false);
  const [output, setOutput] = useState("");
  const [byteCode, setByteCode] = useState("");

  const optionsRef = useLatest(options);
  const transpilingRef = useRef(false);
  const { outputClearOnRun } = useSettings();

  useEffect(() => {
    // Sem limpar, a saída de cada execução fica abaixo da anterior. O executor é um objeto do
    // runner, mutável por natureza: não é estado do React.
    // eslint-disable-next-line react-hooks/immutability
    executor.clearStdOutOnRun = outputClearOnRun;
  }, [executor, outputClearOnRun]);

  useEffect(() => {
    // Programas podem imprimir milhares de linhas por segundo: a saída vai para a tela no
    // máximo uma vez por quadro.
    let frame = 0;

    const flushOutput = () => {
      frame = 0;
      setOutput(executor.stdOut);
    };

    const stdOut = executor.stdOut$.subscribe(() => {
      frame ||= requestAnimationFrame(flushOutput);
    });

    const runningState = executor.running$.subscribe(setRunning);
    const inputState = executor.waitingForInput$.subscribe(setWaitingForInput);

    const events = executor.events.subscribe({
      next: event => {
        switch (event.type) {
          case "finish": {
            setRunning(false);
            setWaitingForInput(false);
            optionsRef.current.onFinish?.();
            break;
          }

          case "error": {
            trackEvent("execution_error", "Execução", "Erro em execução de código");
            break;
          }

          case "message": {
            Promise.resolve(optionsRef.current.onMessage?.(event.message)).catch(console.error);
            break;
          }

          default: {
            break;
          }
        }
      },

      error: error => {
        trackEvent("execution_runner_error", "Execução", "Erro ao carregar o runner para rodar o código");
        captureException(error);
      },
    });

    return () => {
      cancelAnimationFrame(frame);
      stdOut.unsubscribe();
      runningState.unsubscribe();
      inputState.unsubscribe();
      events.unsubscribe();
      executor.stop();
      portugolWorker.abortTranspilation();
    };
  }, [executor, optionsRef]);

  const setTranspilingState = (value: boolean) => {
    transpilingRef.current = value;
    setTranspiling(value);
  };

  const run = useCallback(
    async (code: string) => {
      trackEvent("editor_start_execution", "Editor", "Botão de Iniciar Execução");
      setExtra("code", code);
      setTranspilingState(true);

      let result;

      try {
        result = await portugolWorker.transpileCode(code);
      } catch (error) {
        captureException(error, { tags: { transpile: true }, extra: { code } });

        alert(
          `Ocorreu um erro ao transpilar o código, possivelmente o seu navegador não suporta Web Workers. Por favor, tente novamente em outro navegador. Caso o erro persista, acesse ${LINKS.newIssue}`,
        );
        alert(error);
      } finally {
        setTranspilingState(false);
      }

      if (result) {
        // A checagem ao vivo é debounced: quem edita e roda em menos de 500ms veria as marcas do
        // código anterior. Estas vêm da mesma checagem que decidiu se ia executar.
        optionsRef.current.onDiagnostics?.([...result.diagnostics, ...result.parseErrors]);
        executor.runTranspiled(result);
        setByteCode(executor.byteCode);
        setOutput(executor.stdOut);
      }
    },
    [executor, optionsRef],
  );

  const stop = useCallback(() => {
    trackEvent("editor_stop_execution", "Editor", "Botão de Parar Execução");
    executor.stop();
    setRunning(false);
    setWaitingForInput(false);

    if (transpilingRef.current) {
      portugolWorker.abortTranspilation();
      setTranspilingState(false);
    }

    setOutput(executor.stdOut);
  }, [executor]);

  /**
   * Repassa o que o usuário digita no console para o programa, quando ele está esperando entrada.
   */
  const sendInput = useCallback(
    (key: string) => {
      if (!executor.waitingForInput) {
        return false;
      }

      executor.stdIn.next(key);

      return true;
    },
    [executor],
  );

  const clearOutput = useCallback(() => {
    // O executor é um objeto do runner, mutável por natureza: não é estado do React.
    // eslint-disable-next-line react-hooks/immutability
    executor.stdOut = "";
    setOutput("");
  }, [executor]);

  return {
    executor,
    running,
    waitingForInput,
    transpiling,
    clearOutput,
    busy: running || transpiling,
    output,
    byteCode,
    run,
    stop,
    sendInput,
  };
}
