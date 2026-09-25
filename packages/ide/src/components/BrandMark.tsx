import lightbulb from "/public/assets/lightbulb.svg?raw";

import { cn } from "@/lib/utils";

/**
 * A lâmpada do Portugol, única marca colorida da interface.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex text-brand [&_svg]:h-full [&_svg]:w-auto [&_svg]:fill-current", className)}
      dangerouslySetInnerHTML={{ __html: lightbulb }}
    />
  );
}
