import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./SettingField.module.css";

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
    <div className={cn(styles.field, layout === "inline" ? styles.inline : styles.stacked)}>
      <div className={styles.text}>
        <span id={id} className={styles.label}>
          {label}
        </span>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {children}
    </div>
  );
}
