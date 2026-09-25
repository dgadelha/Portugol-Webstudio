import { ArrowUpRight, Bug, ChevronRight, Heart, History } from "lucide-react";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BUILD_INFO, IS_BETA, LINKS } from "@/config/env";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

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
      <DialogContent className="gap-6 sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-4 text-left">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <BrandMark className="h-8" />
          </span>
          <div className="grid gap-1">
            <DialogTitle className="flex items-center gap-2">
              Portugol Webstudio
              {IS_BETA && <Badge variant="secondary">Beta</Badge>}
            </DialogTitle>
            <p className="font-mono text-xs text-muted-foreground uppercase">Versão {BUILD_INFO.commit}</p>
          </div>
        </DialogHeader>

        <DialogDescription className="leading-relaxed">
          Ambiente online para programar em Portugol (UNIVALI), a linguagem do Portugol Studio. Feito para quem está
          aprendendo: escreva, execute e compartilhe programas direto no navegador.
        </DialogDescription>

        <nav aria-label="Links do projeto" className="divide-y overflow-hidden rounded-lg border">
          <LinkRow
            href={`${LINKS.repository}?utm_source=portugol-webstudio&utm_medium=about_dialog`}
            icon={<img src="/assets/icon-github.svg" alt="" className="size-4 dark:invert" />}
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

        <footer className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Código aberto · GPL-3.0</span>
          <span className="flex items-center gap-1">
            Feito com <Heart className="size-3 fill-current" aria-label="amor" /> no
            <img src="/assets/flag-br.svg" alt="Brasil" className="h-3" />
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
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background [&_svg]:size-4">
        {icon}
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="truncate text-xs text-muted-foreground">{description}</span>
      </span>
      {href ? (
        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      ) : (
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  const className = cn(
    "group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors outline-none",
    "hover:bg-accent/60 focus-visible:bg-accent/60",
  );

  return href ? (
    <a href={href} target="_blank" rel="external noopener" className={className} onClick={onClick}>
      {content}
    </a>
  ) : (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}
