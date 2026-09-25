import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { LINKS } from "@/config/env";

import styles from "./ErrorFallback.module.css";

/**
 * Tela de erro inesperado. O código em edição já foi salvo no navegador, então recarregar é seguro.
 */
export function ErrorFallback({ error }: { error: unknown }) {
  return (
    <div className={styles.fallback}>
      <TriangleAlert className={styles.icon} aria-hidden="true" />
      <h1 className={styles.title}>Algo deu errado no Portugol Webstudio</h1>
      <p className={styles.message}>
        O seu código fica salvo no navegador enquanto você digita. Recarregue a página para continuar; se o erro se
        repetir,{" "}
        <a href={LINKS.reportBug} target="_blank" rel="noreferrer" className={styles.link}>
          conte para a gente
        </a>
        .
      </p>
      {error instanceof Error && <code className={styles.error}>{error.message}</code>}
      <Button
        type="button"
        onClick={() => {
          window.location.reload();
        }}
      >
        Recarregar
      </Button>
    </div>
  );
}
