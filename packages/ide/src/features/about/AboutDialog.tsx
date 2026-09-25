import { ArrowUpRight, Bug, ChevronRight, Heart, History } from "lucide-react";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/BrandMark";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { BUILD_INFO, IS_BETA, LINKS } from "@/config/env";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

import styles from "./AboutDialog.module.css";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChangelog: () => void;
}

export function AboutDialog({ open, onOpenChange, onOpenChangelog }: AboutDialogProps) {
  const track = (action: string, label: string) => {
    trackEvent(action, "about_dialog", label);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader className={styles.header}>
          <span className={styles.mark}>
            <BrandMark className={styles.brandMark} />
          </span>
          <div className={styles.heading}>
            <DialogTitle className={styles.title}>
              Portugol Webstudio
              {IS_BETA && <Badge variant="secondary">Beta</Badge>}
            </DialogTitle>
            <p className={styles.version}>Versão {BUILD_INFO.commit}</p>
          </div>
        </DialogHeader>

        <DialogDescription className={styles.description}>
          Ambiente online para programar em Portugol (UNIVALI), a linguagem do Portugol Studio. Feito para quem está
          aprendendo: escreva, execute e compartilhe programas direto no navegador.
        </DialogDescription>

        <nav aria-label="Links do projeto" className={styles.links}>
          <LinkRow
            href={`${LINKS.repository}?utm_source=portugol-webstudio&utm_medium=about_dialog`}
            icon={<img src="/assets/icon-github.svg" alt="" className={styles.githubIcon} />}
            title="Código-fonte"
            description="O projeto é aberto: contribua no GitHub"
            onClick={() => {
              track("about_source_code", "Código-fonte (diálogo Sobre)");
            }}
          />
          <LinkRow
            href={LINKS.reportBug}
            icon={<Bug />}
            title="Reportar um problema"
            description="Encontrou um erro? Conte para a gente"
            onClick={() => {
              track("about_report_bug", "Reportar um problema (diálogo Sobre)");
            }}
          />
          <LinkRow
            icon={<History />}
            title="Histórico de atualizações"
            description="O que mudou nas últimas versões"
            onClick={() => {
              track("about_changelog", "Histórico de atualizações (diálogo Sobre)");
              onOpenChangelog();
            }}
          />
        </nav>

        <footer className={styles.footer}>
          <span>Código aberto · GPL-3.0</span>
          <span className={styles.madeIn}>
            Feito com <Heart className={styles.heart} aria-label="amor" /> no
            <img src="/assets/flag-br.svg" alt="Brasil" className={styles.flag} />
          </span>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

interface LinkRowProps {
  icon: ReactNode;
  title: string;
  description: string;
  /**
   * Com endereço, abre em outra aba do navegador; sem, é uma ação dentro do IDE.
   */
  href?: string;
  onClick: () => void;
}

function LinkRow({ icon, title, description, href, onClick }: LinkRowProps) {
  const content = (
    <>
      <span className={styles.linkIcon}>{icon}</span>
      <span className={styles.linkText}>
        <span className={styles.linkTitle}>{title}</span>
        <span className={styles.linkDescription}>{description}</span>
      </span>
      {href ? (
        <ArrowUpRight className={cn(styles.linkArrow, styles.external)} />
      ) : (
        <ChevronRight className={cn(styles.linkArrow, styles.internal)} />
      )}
    </>
  );

  return href ? (
    <a href={href} target="_blank" rel="external noopener" className={styles.link} onClick={onClick}>
      {content}
    </a>
  ) : (
    <button type="button" className={styles.link} onClick={onClick}>
      {content}
    </button>
  );
}
