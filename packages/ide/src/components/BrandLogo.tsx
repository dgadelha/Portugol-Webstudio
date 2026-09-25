import { Badge } from "@/components/ui/badge";
import { IS_BETA } from "@/config/env";
import { cn } from "@/lib/utils";

/**
 * As logomarcas são embutidas no HTML (e não carregadas via `<img>`) para que as cores
 * acompanhem o tema pelo CSS (ver `.logo-*` em `globals.css`).
 */
const logos = import.meta.glob<string>("/public/assets/logo/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

type LogoName = "default" | "carnaval" | "pascoa" | "halloween" | "natal" | "ano-novo";

function logoSource(name: LogoName) {
  return logos[`/public/assets/logo/${name}.svg`] ?? "";
}

/**
 * Datas comemorativas trocam a logomarca da aba inicial.
 */
export function seasonalLogo(date = new Date()): LogoName {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 2 && day >= 5) || (month === 3 && day <= 15)) return "carnaval";
  if ((month === 3 && day >= 20) || (month === 4 && day <= 30)) return "pascoa";
  if ((month === 10 && day >= 20) || (month === 11 && day <= 5)) return "halloween";
  if (month === 12 && day >= 15 && day <= 29) return "natal";
  if ((month === 12 && day >= 30) || (month === 1 && day <= 5)) return "ano-novo";

  return "default";
}

interface BrandLogoProps {
  variant?: LogoName;
  className?: string;
}

export function BrandLogo({ variant = "default", className }: BrandLogoProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div
        role="img"
        aria-label="Logomarca do Portugol Webstudio"
        className="[&>svg]:block [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: logoSource(variant) }}
      />

      {/* Selo fora do domínio de produção: fica no canto vazio abaixo de "Webstudio". */}
      {IS_BETA && (
        <Badge variant="secondary" className="pointer-events-none absolute right-0 bottom-0 uppercase">
          Beta
        </Badge>
      )}
    </div>
  );
}
