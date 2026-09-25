import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Switch.module.css";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className={cn(styles.root, className)} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={styles.thumb} />
    </SwitchPrimitive.Root>
  );
}
