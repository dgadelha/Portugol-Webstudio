import { Minus, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { DEFAULT_FONT_SIZE, FONT_SIZE_RANGE, settingsStore } from "../settingsStore";
import { useSettings } from "../useSettings";
import { SettingField } from "./SettingField";

export function EditorSection() {
  const { editorFontSize, editorWordWrap } = useSettings();

  const setFontSize = (size: number) => {
    settingsStore.set("editorFontSize", Math.min(FONT_SIZE_RANGE.max, Math.max(FONT_SIZE_RANGE.min, size)));
  };

  return (
    <div className="grid gap-6">
      <SettingField
        id="setting-font-size"
        label="Tamanho da fonte"
        description={`Usado no editor e na saída. O padrão é ${DEFAULT_FONT_SIZE}px.`}
      >
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Diminuir fonte"
            disabled={editorFontSize <= FONT_SIZE_RANGE.min}
            onClick={() => {
              setFontSize(editorFontSize - 1);
            }}
          >
            <Minus />
          </Button>
          <Slider
            aria-labelledby="setting-font-size"
            className="flex-1"
            min={FONT_SIZE_RANGE.min}
            max={FONT_SIZE_RANGE.max}
            step={1}
            value={[editorFontSize]}
            onValueChange={([value]) => {
              if (value !== undefined) setFontSize(value);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Aumentar fonte"
            disabled={editorFontSize >= FONT_SIZE_RANGE.max}
            onClick={() => {
              setFontSize(editorFontSize + 1);
            }}
          >
            <Plus />
          </Button>
          <Badge variant="secondary" className="w-12 justify-center font-mono tabular-nums">
            {editorFontSize}px
          </Badge>
        </div>
      </SettingField>

      <Separator />

      <SettingField
        id="setting-word-wrap"
        label="Quebra de linha"
        description="Linhas longas continuam embaixo em vez de rolar para o lado."
        layout="inline"
      >
        <Switch
          aria-labelledby="setting-word-wrap"
          checked={editorWordWrap}
          onCheckedChange={checked => {
            settingsStore.set("editorWordWrap", checked);
          }}
        />
      </SettingField>

      <CodePreview fontSize={editorFontSize} wordWrap={editorWordWrap} />
    </div>
  );
}

/**
 * Prévia do editor com as preferências atuais.
 */
function CodePreview({ fontSize, wordWrap }: { fontSize: number; wordWrap: boolean }) {
  const lines: Array<{ indent: number; parts: Array<[string, string?]> }> = [
    { indent: 0, parts: [["programa", "text-sky-600 dark:text-sky-400"], [" {"]] },
    {
      indent: 1,
      parts: [["funcao", "text-sky-600 dark:text-sky-400"], [" "], ["inicio", "text-amber-600 dark:text-amber-300"], ["() {"]],
    },
    {
      indent: 2,
      parts: [
        ["escreva", "text-amber-600 dark:text-amber-300"],
        ["("],
        ['"Olá! Esta linha é comprida para mostrar como a quebra de linha funciona no editor."', "text-orange-700 dark:text-orange-300"],
        [")"],
      ],
    },
    { indent: 1, parts: [["}"]] },
    { indent: 0, parts: [["}"]] },
  ];

  return (
    <figure className="grid gap-2">
      <figcaption className="text-xs font-medium text-muted-foreground">Prévia</figcaption>
      <pre
        className="overflow-x-auto rounded-lg border bg-muted/40 p-4 font-mono leading-relaxed"
        style={{ fontSize, whiteSpace: wordWrap ? "pre-wrap" : "pre" }}
      >
        {lines.map((line, index) => (
          <div key={index} style={{ paddingLeft: `${line.indent * 2}ch` }}>
            {line.parts.map(([text, className], partIndex) => (
              <span key={partIndex} className={className}>
                {text}
              </span>
            ))}
          </div>
        ))}
      </pre>
    </figure>
  );
}
