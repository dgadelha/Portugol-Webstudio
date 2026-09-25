import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SettingFieldProps {
  id: string;
  label: string;
  description?: string;
  /**
   * Controle ao lado do texto (switch) ou abaixo dele (opções maiores).
   */
  layout?: "inline" | "stacked";
  children: ReactNode;
}

export function SettingField({ id, label, description, layout = "stacked", children }: SettingFieldProps) {
  return (
    <div className={cn("flex gap-4", layout === "inline" ? "items-center justify-between" : "flex-col")}>
      <div className="grid gap-1">
        <span id={id} className="text-sm leading-none font-medium">
          {label}
        </span>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
