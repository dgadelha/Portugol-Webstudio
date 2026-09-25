import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Kbd.module.css";

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd data-slot="kbd" className={cn(styles.kbd, className)} {...props} />;
}
