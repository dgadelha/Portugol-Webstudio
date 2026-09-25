import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { useRouteError } from "react-router";

import { ErrorFallback } from "./ErrorFallback";

/**
 * Erro durante a renderização de uma rota: registra no Sentry e oferece recarregar.
 */
export function RouteError() {
  const error = useRouteError();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <ErrorFallback error={error} />;
}
