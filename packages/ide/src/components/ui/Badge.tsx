import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Badge.module.css";

type BadgeVariant = "default" | "secondary" | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(styles.badge, styles[variant], className)}
      {...props}
    />
  );
}
