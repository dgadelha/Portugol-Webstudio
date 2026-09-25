import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IconButtonProps extends Omit<ComponentProps<typeof Button>, "children"> {
  /**
   * Texto do tooltip e rótulo acessível do botão.
   */
  label: string;
  icon: ReactNode;
  tooltipSide?: ComponentProps<typeof TooltipContent>["side"];
}

/**
 * Botão só com ícone: o rótulo aparece como tooltip e é lido por leitores de tela.
 */
export function IconButton({ label, icon, tooltipSide, variant = "ghost", size = "icon", ...props }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant={variant} size={size} aria-label={label} {...props}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  );
}
