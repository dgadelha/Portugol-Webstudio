import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { Button } from "@/components/ui/Button";

import styles from "./UpdatePrompt.module.css";

/**
 * De quanto em quanto tempo procurar uma versão nova do IDE.
 */
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000;

const UPDATE_TOAST_ID = "pwa-update";

/**
 * Registra o service worker e avisa quando há uma versão nova pronta. Recarregar é decisão do
 * usuário: o código em edição pode não ter sido baixado ainda.
 */
export function UpdatePrompt() {
  const interval = useRef<ReturnType<typeof setInterval>>(undefined);

  const registration = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) {
        return;
      }

      registration.addEventListener("updatefound", () => {
        // Na primeira instalação não há versão anterior: nada a anunciar.
        if (registration.active) {
          toast.loading("Baixando atualizações…", { id: UPDATE_TOAST_ID, duration: 5000 });
        }
      });

      clearInterval(interval.current);
      interval.current = setInterval(() => {
        registration.update().catch(() => {});
      }, UPDATE_CHECK_INTERVAL);
    },
    onRegisterError(error) {
      console.error("Service worker registration failed:", error);
    },
  });

  const [needRefresh, setNeedRefresh] = registration.needRefresh;
  const { updateServiceWorker } = registration;

  useEffect(() => {
    return () => {
      clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    if (!needRefresh) {
      return;
    }

    toast.custom(
      id => (
        <div className={styles.toast}>
          <strong>Uma nova versão do Portugol Webstudio está disponível</strong>
          <p>Lembre-se de salvar os seus arquivos antes de atualizar.</p>
          <p>Quando estiver pronto, basta atualizar a página ou clicar no botão abaixo.</p>

          <div className={styles.actions}>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    'Lembre-se de salvar seu código antes de recarregar a página!\n\nAperte "OK" para recarregar a página, ou "Cancelar" para abortar.',
                  )
                ) {
                  void updateServiceWorker(true);
                }
              }}
            >
              Atualizar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                toast.dismiss(id);
                setNeedRefresh(false);
              }}
            >
              Ignorar
            </Button>
          </div>
        </div>
      ),
      { id: UPDATE_TOAST_ID, duration: Infinity },
    );
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}
