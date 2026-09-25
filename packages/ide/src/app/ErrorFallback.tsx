import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LINKS } from "@/config/env";

/**
 * Tela de erro inesperado. O código em edição já foi salvo no navegador, então recarregar é seguro.
 */
export function ErrorFallback({ error }: { error: unknown }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <TriangleAlert className="size-12 text-destructive" aria-hidden="true" />
      <h1 className="text-xl font-bold">Algo deu errado no Portugol Webstudio</h1>
      <p className="max-w-lg text-sm text-muted-foreground">
        O seu código fica salvo no navegador enquanto você digita. Recarregue a página para continuar; se o erro se
        repetir,{" "}
        <a href={LINKS.reportBug} target="_blank" rel="noreferrer" className="underline">
          conte para a gente
        </a>
        .
      </p>
      {error instanceof Error && <code className="max-w-lg text-xs text-muted-foreground">{error.message}</code>}
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
