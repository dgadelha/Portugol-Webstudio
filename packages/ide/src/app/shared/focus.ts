import { afterNextRender, Injector } from "@angular/core";

/**
 * Foca um elemento depois da próxima renderização: quando ele acabou de
 * aparecer (uma aba nova, um painel aberto) ou quando o que tinha o foco sumiu.
 */
export function focusAfterRender(injector: Injector, find: () => HTMLElement | null | undefined) {
  afterNextRender(
    () => {
      find()?.focus();
    },
    { injector },
  );
}

/**
 * Seletor da aba em foco na barra de abas.
 */
export const ACTIVE_TAB_SELECTOR = "[role=tab][aria-selected=true]";
