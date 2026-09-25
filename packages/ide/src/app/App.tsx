import * as Sentry from "@sentry/react";
import { RouterProvider } from "react-router/dom";

import { Toaster } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { UpdatePrompt } from "@/features/pwa/UpdatePrompt";
import { ThemeSync } from "@/features/settings/ThemeSync";

import { ErrorFallback } from "./ErrorFallback";
import { router } from "./router";

export function App() {
  return (
    <Sentry.ErrorBoundary fallback={({ error }) => <ErrorFallback error={error} />}>
      <ThemeSync />
      <TooltipProvider delayDuration={400}>
        <RouterProvider router={router} />
      </TooltipProvider>
      <Toaster position="bottom-right" />
      <UpdatePrompt />
    </Sentry.ErrorBoundary>
  );
}
