import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./AlertDialog.module.css";
import { Button, type ButtonStyleProps } from "./Button";
import dialogStyles from "./Dialog.module.css";

export function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

export function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={dialogStyles.overlay} />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(styles.content, className)}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn(styles.header, className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn(styles.footer, className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn(styles.title, className)} {...props} />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(styles.description, className)}
      {...props}
    />
  );
}

export function AlertDialogAction({
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & ButtonStyleProps) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action data-slot="alert-dialog-action" {...props} />
    </Button>
  );
}

export function AlertDialogCancel({
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & ButtonStyleProps) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" {...props} />
    </Button>
  );
}
