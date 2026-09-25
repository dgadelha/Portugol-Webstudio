import { Minus, Plus } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";

import { FONT_SIZE_RANGE } from "../settingsStore";
import styles from "./FontSizeControl.module.css";

interface FontSizeControlProps {
  /**
   * `id` do rótulo do campo.
   */
  labelledBy: string;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Tamanho da fonte em px: botões de um em um e um controle deslizante para saltos maiores.
 */
export function FontSizeControl({ labelledBy, value, onChange }: FontSizeControlProps) {
  const change = (size: number) => {
    onChange(Math.min(FONT_SIZE_RANGE.max, Math.max(FONT_SIZE_RANGE.min, size)));
  };

  return (
    <div className={styles.control}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Diminuir fonte"
        disabled={value <= FONT_SIZE_RANGE.min}
        onClick={() => {
          change(value - 1);
        }}
      >
        <Minus />
      </Button>
      <Slider
        aria-labelledby={labelledBy}
        className={styles.slider}
        min={FONT_SIZE_RANGE.min}
        max={FONT_SIZE_RANGE.max}
        step={1}
        value={[value]}
        onValueChange={([size]) => {
          if (size !== undefined) change(size);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Aumentar fonte"
        disabled={value >= FONT_SIZE_RANGE.max}
        onClick={() => {
          change(value + 1);
        }}
      >
        <Plus />
      </Button>
      <Badge variant="secondary" className={styles.value}>
        {value}px
      </Badge>
    </div>
  );
}
