import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Skeleton.module.css";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn(styles.skeleton, className)} {...props} />;
}
