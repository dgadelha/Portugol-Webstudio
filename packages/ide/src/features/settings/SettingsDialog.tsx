import { Check, Code2, type LucideIcon, Palette, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";

import { AppearanceSection } from "./components/AppearanceSection";
import { EditorSection } from "./components/EditorSection";
import { settingsStore } from "./settingsStore";
import styles from "./SettingsDialog.module.css";

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
      <DialogContent className={styles.content}>
        <nav aria-label="Seções das configurações" className={styles.nav}>
          <DialogTitle className={styles.title}>Configurações</DialogTitle>

          <div className={styles.sections}>
            {SECTIONS.map(item => (
              <button
                key={item.id}
                type="button"
                aria-current={item.id === sectionId ? "page" : undefined}
                className={styles.section}
                onClick={() => {
                  setSectionId(item.id);
                }}
              >
                <item.icon className={styles.sectionIcon} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className={styles.main}>
          <header className={styles.header}>
            <h2 className={styles.sectionTitle}>{section.label}</h2>
            <DialogDescription>{section.description}</DialogDescription>
          </header>

          <div className={styles.body}>{sectionId === "appearance" ? <AppearanceSection /> : <EditorSection />}</div>

          <footer className={styles.footer}>
            <span className={styles.saved}>
              <Check className={styles.savedIcon} />
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
