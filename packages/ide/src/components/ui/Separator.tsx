import { Separator as SeparatorPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Separator.module.css";

export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(styles.separator, className)}
      {...props}
    />
  );
}
