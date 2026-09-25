import type * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

export function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof Group>) {
  return <Group data-slot="resizable-panel-group" className={cn("flex h-full w-full", className)} {...props} />;
}

export function ResizablePanel({ className, ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" className={cn("overflow-hidden", className)} {...props} />;
}

/**
 * Divisória de 1px, como a do shadcn; engrossa no hover e no arrasto. A área de arrasto é bem
 * maior que a linha.
 */
export function ResizableHandle({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "relative z-10 flex shrink-0 items-center justify-center bg-border transition-colors outline-none",
        // No hover e no arrasto a linha engrossa com uma sombra, sem mudar o layout dos painéis.
        "hover:bg-ring hover:shadow-[0_0_0_1px_var(--ring)] focus-visible:bg-ring focus-visible:shadow-[0_0_0_1px_var(--ring)]",
        "data-[separator=active]:bg-ring data-[separator=active]:shadow-[0_0_0_1px_var(--ring)]",
        "aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
        "aria-[orientation=horizontal]:after:absolute aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:-inset-y-2",
        "aria-[orientation=vertical]:h-full aria-[orientation=vertical]:w-px",
        "aria-[orientation=vertical]:after:absolute aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:-inset-x-2",
        className,
      )}
      {...props}
    />
  );
}
