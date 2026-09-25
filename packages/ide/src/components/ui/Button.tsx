import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./Button.module.css";

export type ButtonVariant = "default" | "destructive" | "outline" | "ghost";
export type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: styles.default,
  destructive: styles.destructive,
  outline: styles.outline,
  ghost: styles.ghost,
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  default: styles.sizeDefault,
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
  "icon-xs": styles.sizeIconXs,
  "icon-sm": styles.sizeIconSm,
};

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function buttonClass({ variant = "default", size = "default" }: ButtonStyleProps = {}, className?: string) {
  return cn(styles.button, VARIANT_CLASS[variant], SIZE_CLASS[size], className);
}

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & ButtonStyleProps & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={buttonClass({ variant, size }, className)}
      {...props}
    />
  );
}
