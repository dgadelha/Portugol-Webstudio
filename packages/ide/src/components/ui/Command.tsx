import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./Dialog";
import styles from "./Command.module.css";

export function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn(styles.command, className)} {...props} />;
}

export function CommandDialog({
  title = "Paleta de comandos",
  description = "Busque uma ação para executar…",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className={styles.dialogContent}>
        <Command className={styles.dialogCommand}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className={styles.inputWrapper}>
      <SearchIcon className={styles.searchIcon} />
      <CommandPrimitive.Input data-slot="command-input" className={cn(styles.input, className)} {...props} />
    </div>
  );
}

export function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" className={cn(styles.list, className)} {...props} />;
}

export function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={styles.empty} {...props} />;
}

export function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group data-slot="command-group" className={cn(styles.group, className)} {...props} />;
}

export function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator data-slot="command-separator" className={cn(styles.separator, className)} {...props} />
  );
}

export function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item data-slot="command-item" className={cn(styles.item, className)} {...props} />;
}

export function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="command-shortcut" className={cn(styles.shortcut, className)} {...props} />;
}
