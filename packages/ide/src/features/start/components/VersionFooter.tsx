import { ArrowUpRight, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BUILD_INFO, IS_BETA, LINKS } from "@/config/env";
import { useAppDialogs } from "@/features/appDialogs/appDialogsContext";
import { trackEvent } from "@/lib/analytics";

/**
 * Botões do rodapé: transparentes, com fundo semitransparente só no hover.
 */
const footerButton = "h-7 px-2 text-xs font-normal text-muted-foreground hover:bg-accent/50 hover:text-foreground";

/**
 * Versão do build, o atalho entre a versão estável e a beta, e o "Sobre".
 */
export function VersionFooter() {
  const { openAbout } = useAppDialogs();
  const other = IS_BETA
    ? {
        href: LINKS.stable,
        label: "Ir para a versão estável",
        tooltip: "O código salvo no navegador fica separado em cada versão",
        event: ["open_stable_version", "Ir para a versão estável"] as const,
      }
    : {
        href: LINKS.beta,
        label: "Experimentar a versão beta",
        tooltip: "Novidades antes de chegarem a todos. O código salvo no navegador fica separado em cada versão",
        event: ["open_beta_version", "Experimentar a versão beta"] as const,
      };

  return (
    <footer className="flex shrink-0 items-center justify-center gap-1 px-4 py-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="px-2 font-mono text-xs text-muted-foreground uppercase">{BUILD_INFO.commit}</span>
        </TooltipTrigger>
        {BUILD_INFO.date && <TooltipContent>{BUILD_INFO.date}</TooltipContent>}
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="xs" className={footerButton}>
            <a
              href={other.href}
              target="_blank"
              rel="external noopener"
              onClick={() => {
                trackEvent(other.event[0], "Aba Inicial", other.event[1]);
              }}
            >
              {other.label}
              <ArrowUpRight />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{other.tooltip}</TooltipContent>
      </Tooltip>

      <Button
        type="button"
        variant="ghost"
        size="xs"
        className={footerButton}
        onClick={() => {
          trackEvent("open_about_dialog", "Aba Inicial", "Abrir diálogo Sobre");
          openAbout();
        }}
      >
        <Info />
        Sobre
      </Button>
    </footer>
  );
}
