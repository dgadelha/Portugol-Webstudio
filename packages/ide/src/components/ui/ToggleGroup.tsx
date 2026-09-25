import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./ToggleGroup.module.css";

type ToggleGroupProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
};

/**
 * Grupo de opções em que sempre uma está escolhida, como um grupo de rádios em forma de botões.
 */
export function ToggleGroup({ className, onValueChange, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      type="single"
      className={cn(styles.root, className)}
      onValueChange={value => {
        // Clicar na opção já escolhida desmarcaria tudo.
        if (value) onValueChange(value);
      }}
      {...props}
    />
  );
}

export function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return <ToggleGroupPrimitive.Item data-slot="toggle-group-item" className={cn(styles.item, className)} {...props} />;
}
