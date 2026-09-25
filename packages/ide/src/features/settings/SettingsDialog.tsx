import { Check, Code2, type LucideIcon, Palette, RotateCcw, SquareTerminal } from "lucide-react";
import { type ComponentType, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { trackEvent } from "@/lib/analytics";

import { AppearanceSection } from "./components/AppearanceSection";
import { EditorSection } from "./components/EditorSection";
import { OutputSection } from "./components/OutputSection";
import { type Settings, settingsStore } from "./settingsStore";
import styles from "./SettingsDialog.module.css";

type SectionId = "appearance" | "editor" | "output";

const SECTIONS: Array<{ id: SectionId; label: string; description: string; icon: LucideIcon }> = [
  { id: "appearance", label: "Aparência", description: "Tema da interface e do editor.", icon: Palette },
  { id: "editor", label: "Editor", description: "Como o código aparece enquanto você escreve.", icon: Code2 },
  { id: "output", label: "Saída", description: "O que o programa escreve enquanto executa.", icon: SquareTerminal },
];

const SECTION_CONTENT: Record<SectionId, ComponentType> = {
  appearance: AppearanceSection,
  editor: EditorSection,
  output: OutputSection,
};

/**
 * Uma espera por configuração, para o controle deslizante não registrar cada passo do arraste.
 */
const TRACK_CHANGE_DELAY = 1000;

/**
 * Registra no Analytics cada configuração alterada enquanto o diálogo está aberto e devolve o
 * "Restaurar padrões", que é registrado à parte.
 */
function useTrackedSettings(open: boolean) {
  const resetting = useRef(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let previous = settingsStore.getSnapshot();
    const pending = new Map<keyof Settings, { value: unknown; timer: number }>();

    const send = (key: keyof Settings, value: unknown) => {
      pending.delete(key);
      trackEvent("settings_change", "Configurações", `${key}=${String(value)}`);
    };

    const unsubscribe = settingsStore.subscribe(() => {
      const current = settingsStore.getSnapshot();

      for (const key of Object.keys(current) as Array<keyof Settings>) {
        if (current[key] !== previous[key]) {
          clearTimeout(pending.get(key)?.timer);
          pending.delete(key);

          if (!resetting.current) {
            const value = current[key];
            pending.set(key, { value, timer: window.setTimeout(send, TRACK_CHANGE_DELAY, key, value) });
          }
        }
      }

      previous = current;
    });

    return () => {
      unsubscribe();

      // Uma mudança feita logo antes de fechar o diálogo ainda é registrada.
      for (const [key, { value, timer }] of pending) {
        clearTimeout(timer);
        send(key, value);
      }
    };
  }, [open]);

  return () => {
    trackEvent("settings_reset", "Configurações", "Restaurar padrões");

    // O store avisa os ouvintes na hora: as chaves apagadas não viram `settings_change`.
    resetting.current = true;
    settingsStore.reset();
    resetting.current = false;
  };
}

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
  const SectionContent = SECTION_CONTENT[section.id];
  const resetDefaults = useTrackedSettings(open);

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

          <div className={styles.body}>
            <SectionContent />
          </div>

          <footer className={styles.footer}>
            <span className={styles.saved}>
              <Check className={styles.savedIcon} />
              Salvo automaticamente
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={resetDefaults}>
              <RotateCcw />
              Restaurar padrões
            </Button>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
