import type * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

import styles from "./Resizable.module.css";

export function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof Group>) {
  return <Group data-slot="resizable-panel-group" className={cn(styles.group, className)} {...props} />;
}

export function ResizablePanel({ className, ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" className={cn(styles.panel, className)} {...props} />;
}

/**
 * Divisória de 1px; engrossa no hover e no arrasto. A área de arrasto é bem maior que a linha.
 */
export function ResizableHandle({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="resizable-handle" className={cn(styles.handle, className)} {...props} />;
}
