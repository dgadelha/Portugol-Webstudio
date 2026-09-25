import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./ScrollArea.module.css";

export function ScrollArea({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn(styles.root, className)} {...props}>
      <ScrollAreaPrimitive.Viewport data-slot="scroll-area-viewport" className={styles.viewport}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(styles.scrollbar, className)}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb data-slot="scroll-area-thumb" className={styles.thumb} />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}
