import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./styles/globals.css";

import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { getWorkspaceStore } from "./features/workspace/workspaceStore";
import { initAnalytics } from "./lib/analytics";
import { setupMonaco } from "./lib/monaco/setup";
import { initSentry } from "./lib/sentry";

initSentry();
initAnalytics();
setupMonaco();

// A área de trabalho é decidida antes do primeiro render: adotar a sessão anterior, recuperar
// uma janela fechada ou começar do zero.
getWorkspaceStore();

createRoot(document.querySelector("#root")!, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
