import lightbulb from "/public/assets/lightbulb.svg?raw";

import { cn } from "@/lib/utils";

import styles from "./BrandMark.module.css";

/**
 * A lâmpada do Portugol, única marca colorida da interface.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn(styles.mark, className)} dangerouslySetInnerHTML={{ __html: lightbulb }} />
  );
}
