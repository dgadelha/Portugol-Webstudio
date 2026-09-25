import { Check } from "lucide-react";
import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { settingsStore, type ThemePreference } from "../settingsStore";
import { useSettings } from "../useSettings";
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
      <div role="radiogroup" aria-labelledby="setting-theme" className="grid grid-cols-3 gap-3" onKeyDown={onKeyDown}>
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
              className="group grid gap-2 text-left outline-none"
              onClick={() => {
                settingsStore.set("theme", option.value);
              }}
            >
              <span
                className={cn(
                  "relative block overflow-hidden rounded-lg border-2 transition-colors",
                  "group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50",
                  selected ? "border-primary" : "border-border group-hover:border-muted-foreground/40",
                )}
              >
                <ThemePreview theme={option.value} />
                {selected && (
                  <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </span>
              <span className={cn("text-sm", selected ? "font-medium" : "text-muted-foreground")}>{option.label}</span>
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
      <span className="relative block">
        <Mockup variant="light" />
        <span className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
          <Mockup variant="dark" />
        </span>
      </span>
    );
  }

  return <Mockup variant={theme} />;
}

function Mockup({ variant }: { variant: "light" | "dark" }) {
  const dark = variant === "dark";

  return (
    <span className={cn("flex aspect-[4/3] w-full gap-1.5 p-2", dark ? "bg-neutral-950" : "bg-white")}>
      <span className={cn("w-3 rounded-sm", dark ? "bg-neutral-800" : "bg-neutral-100")} />
      <span className="flex flex-1 flex-col gap-1.5">
        <span className="flex gap-1">
          <span className={cn("h-2.5 w-6 rounded-sm", dark ? "bg-neutral-700" : "bg-neutral-200")} />
          <span className={cn("h-2.5 w-4 rounded-sm", dark ? "bg-neutral-800" : "bg-neutral-100")} />
        </span>
        <span className={cn("flex flex-1 flex-col gap-1 rounded-sm p-1.5", dark ? "bg-neutral-900" : "bg-neutral-50")}>
          <span className="h-1 w-3/4 rounded-full bg-sky-500/70" />
          <span className="ml-2 h-1 w-1/2 rounded-full bg-amber-500/70" />
          <span className={cn("ml-2 h-1 w-2/3 rounded-full", dark ? "bg-neutral-600" : "bg-neutral-300")} />
          <span className="h-1 w-1/4 rounded-full bg-sky-500/70" />
        </span>
      </span>
    </span>
  );
}
