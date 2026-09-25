import { Check, Code2, type LucideIcon, Palette, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { AppearanceSection } from "./components/AppearanceSection";
import { EditorSection } from "./components/EditorSection";
import { settingsStore } from "./settingsStore";

type SectionId = "appearance" | "editor";

const SECTIONS: Array<{ id: SectionId; label: string; description: string; icon: LucideIcon }> = [
  { id: "appearance", label: "Aparência", description: "Tema da interface e do editor.", icon: Palette },
  { id: "editor", label: "Editor", description: "Como o código aparece enquanto você escreve.", icon: Code2 },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Preferências do usuário, organizadas em seções. As mudanças valem na hora e ficam salvas
 * neste navegador.
 */
export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [sectionId, setSectionId] = useState<SectionId>("appearance");
  const section = SECTIONS.find(item => item.id === sectionId) ?? SECTIONS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(520px,90vh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl md:flex-row">
        <nav
          aria-label="Seções das configurações"
          className="flex shrink-0 flex-col gap-1 border-b bg-muted/40 p-3 md:w-56 md:border-r md:border-b-0"
        >
          <DialogTitle className="px-2 pt-1 pb-3 text-base">Configurações</DialogTitle>

          <div className="flex gap-1 md:flex-col">
            {SECTIONS.map(item => (
              <button
                key={item.id}
                type="button"
                aria-current={item.id === sectionId ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors outline-none",
                  "hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-sm",
                  "dark:aria-[current=page]:bg-accent",
                )}
                onClick={() => {
                  setSectionId(item.id);
                }}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="border-b px-6 py-4">
            <h2 className="font-semibold">{section.label}</h2>
            <DialogDescription>{section.description}</DialogDescription>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {sectionId === "appearance" ? <AppearanceSection /> : <EditorSection />}
          </div>

          <footer className="flex items-center justify-between gap-4 border-t px-6 py-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="size-3.5" />
              Salvo automaticamente
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                settingsStore.reset();
              }}
            >
              <RotateCcw />
              Restaurar padrões
            </Button>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
