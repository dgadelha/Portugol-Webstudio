import { GOOGLE_ANALYTICS_ID, IS_PRODUCTION, RELEASE_CHANNEL } from "@/config/env";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/**
 * Carrega o Google Analytics (gtag.js). Só em produção: o desenvolvimento local não polui as métricas.
 */
export function initAnalytics() {
  if (!IS_PRODUCTION || window.gtag) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // O gtag.js espera o objeto `arguments`, não um array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  window.gtag("js", new Date());
  // Parâmetros do `set` acompanham todos os eventos, inclusive o `page_view` automático.
  window.gtag("set", { app_channel: RELEASE_CHANNEL });
  window.gtag("config", GOOGLE_ANALYTICS_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  document.head.append(script);
}

/**
 * Registra um evento com os mesmos campos que o IDE sempre enviou (categoria, rótulo e valor).
 */
export function trackEvent(action: string, category?: string, label?: string, value?: number) {
  const params: Record<string, unknown> = {};

  if (category !== undefined) params.event_category = category;
  if (label !== undefined) params.event_label = label;
  if (value !== undefined) params.value = value;

  window.gtag?.("event", action, params);
}

export function trackPageView(path: string, title: string) {
  window.gtag?.("config", GOOGLE_ANALYTICS_ID, {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}
