import { Check } from "lucide-react";
import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { settingsStore, type ThemePreference } from "../settingsStore";
import { useSettings } from "../useSettings";
import styles from "./AppearanceSection.module.css";
import { SettingField } from "./SettingField";

const THEMES: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "auto", label: "Sistema" },
];

export function AppearanceSection() {
  const { theme } = useSettings();

  // Setas trocam a opção, como num grupo de rádios nativo.
  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];

    if (step) {
      event.preventDefault();

      const index = THEMES.findIndex(option => option.value === theme);
      const next = THEMES[(index + step + THEMES.length) % THEMES.length];

      settingsStore.set("theme", next.value);
      event.currentTarget.querySelector<HTMLElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
    }
  };

  return (
    <SettingField
      id="setting-theme"
      label="Tema"
      description="Sistema acompanha o modo claro ou escuro do seu dispositivo."
    >
      <div role="radiogroup" aria-labelledby="setting-theme" className={styles.options} onKeyDown={onKeyDown}>
        {THEMES.map(option => {
          const selected = option.value === theme;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              data-value={option.value}
              tabIndex={selected ? 0 : -1}
              className={styles.option}
              onClick={() => {
                settingsStore.set("theme", option.value);
              }}
            >
              <span className={styles.frame}>
                <ThemePreview theme={option.value} />
                {selected && (
                  <span className={styles.check}>
                    <Check className={styles.checkIcon} />
                  </span>
                )}
              </span>
              <span className={styles.label}>{option.label}</span>
            </button>
          );
        })}
      </div>
    </SettingField>
  );
}

/**
 * Miniatura do IDE no tema: barra lateral, abas e linhas de código. "Sistema" mostra metade
 * clara e metade escura.
 */
function ThemePreview({ theme }: { theme: ThemePreference }) {
  if (theme === "auto") {
    return (
      <span className={styles.split}>
        <Mockup variant="light" />
        <span className={styles.splitDark}>
          <Mockup variant="dark" />
        </span>
      </span>
    );
  }

  return <Mockup variant={theme} />;
}

function Mockup({ variant }: { variant: "light" | "dark" }) {
  return (
    <span data-variant={variant} className={styles.mockup}>
      <span className={styles.mockupSidebar} />
      <span className={styles.mockupMain}>
        <span className={styles.mockupTabs}>
          <span className={styles.mockupActiveTab} />
          <span className={styles.mockupTab} />
        </span>
        <span className={styles.mockupEditor}>
          <span className={cn(styles.line, styles.programLine)} />
          <span className={cn(styles.line, styles.callLine)} />
          <span className={cn(styles.line, styles.textLine)} />
          <span className={cn(styles.line, styles.endLine)} />
        </span>
      </span>
    </span>
  );
}
