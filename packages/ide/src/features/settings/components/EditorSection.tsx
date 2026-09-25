import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";

import {
  DEFAULT_FONT_SIZE,
  type EditorCursorStyle,
  type EditorLineNumbers,
  type EditorRenderWhitespace,
  type Settings,
  settingsStore,
} from "../settingsStore";
import { useSettings } from "../useSettings";
import styles from "./EditorSection.module.css";
import { FontSizeControl } from "./FontSizeControl";
import { SettingField } from "./SettingField";

const TAB_SIZES = [2, 4, 8];

const LINE_NUMBERS: Array<{ value: EditorLineNumbers; label: string }> = [
  { value: "on", label: "Exibir" },
  { value: "relative", label: "Relativos" },
  { value: "off", label: "Ocultar" },
];

const RENDER_WHITESPACE: Array<{ value: EditorRenderWhitespace; label: string }> = [
  { value: "none", label: "Nunca" },
  { value: "selection", label: "Na seleção" },
  { value: "all", label: "Sempre" },
];

const CURSOR_STYLES: Array<{ value: EditorCursorStyle; label: string }> = [
  { value: "line", label: "Linha" },
  { value: "block", label: "Bloco" },
  { value: "underline", label: "Sublinhado" },
];

type BooleanSetting = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never;
}[keyof Settings];

const SWITCHES: Array<{ key: BooleanSetting; id: string; label: string; description: string }> = [
  {
    key: "editorMinimap",
    id: "setting-minimap",
    label: "Minimapa",
    description: "Miniatura do código ao lado da barra de rolagem.",
  },
  {
    key: "editorIndentationGuides",
    id: "setting-indentation-guides",
    label: "Guias de indentação",
    description: "Linhas verticais ligando o início e o fim de cada bloco.",
  },
  {
    key: "editorBracketPairColorization",
    id: "setting-bracket-pair-colorization",
    label: "Colorir pares de chaves e parênteses",
    description: "Cada nível de chaves e parênteses ganha uma cor.",
  },
  {
    key: "editorAutoClosing",
    id: "setting-auto-closing",
    label: "Fechar chaves e aspas automaticamente",
    description: "Ao abrir chaves, parênteses ou aspas, o fechamento já aparece.",
  },
];

export function EditorSection() {
  const settings = useSettings();

  return (
    <div className={styles.section}>
      <SettingField
        id="setting-font-size"
        label="Tamanho da fonte"
        description={`Usado no editor e, até ser alterado na seção Saída, também na saída. O padrão é ${DEFAULT_FONT_SIZE}px.`}
      >
        <FontSizeControl
          labelledBy="setting-font-size"
          value={settings.editorFontSize}
          onChange={size => {
            settingsStore.set("editorFontSize", size);
          }}
        />
      </SettingField>

      <SettingField
        id="setting-word-wrap"
        label="Quebra de linha"
        description="Linhas longas continuam embaixo em vez de rolar para o lado."
        layout="inline"
      >
        <Switch
          aria-labelledby="setting-word-wrap"
          checked={settings.editorWordWrap}
          onCheckedChange={checked => {
            settingsStore.set("editorWordWrap", checked);
          }}
        />
      </SettingField>

      <div className={styles.row}>
        <SettingField id="setting-tab-size" label="Tamanho da tabulação">
          <ToggleGroup
            aria-labelledby="setting-tab-size"
            value={String(settings.editorTabSize)}
            onValueChange={value => {
              settingsStore.set("editorTabSize", Number(value));
            }}
          >
            {TAB_SIZES.map(size => (
              <ToggleGroupItem key={size} value={String(size)} className={styles.tabSize}>
                {size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </SettingField>

        <SettingField id="setting-insert-spaces" label="Indentar com">
          <ToggleGroup
            aria-labelledby="setting-insert-spaces"
            value={String(settings.editorInsertSpaces)}
            onValueChange={value => {
              settingsStore.set("editorInsertSpaces", value === "true");
            }}
          >
            <ToggleGroupItem value="true">Espaços</ToggleGroupItem>
            <ToggleGroupItem value="false">Tabulações</ToggleGroupItem>
          </ToggleGroup>
        </SettingField>
      </div>

      <CodePreview
        fontSize={settings.editorFontSize}
        wordWrap={settings.editorWordWrap}
        tabSize={settings.editorTabSize}
      />

      <Separator />

      <SettingField
        id="setting-line-numbers"
        label="Números das linhas"
        description="Relativos contam a partir da linha do cursor."
      >
        <ToggleGroup
          aria-labelledby="setting-line-numbers"
          value={settings.editorLineNumbers}
          onValueChange={value => {
            settingsStore.set("editorLineNumbers", value as EditorLineNumbers);
          }}
        >
          {LINE_NUMBERS.map(option => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingField>

      <SettingField
        id="setting-render-whitespace"
        label="Exibir espaços em branco"
        description="Espaços aparecem como pontos e tabulações como setas."
      >
        <ToggleGroup
          aria-labelledby="setting-render-whitespace"
          value={settings.editorRenderWhitespace}
          onValueChange={value => {
            settingsStore.set("editorRenderWhitespace", value as EditorRenderWhitespace);
          }}
        >
          {RENDER_WHITESPACE.map(option => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingField>

      <SettingField id="setting-cursor-style" label="Estilo do cursor">
        <ToggleGroup
          aria-labelledby="setting-cursor-style"
          value={settings.editorCursorStyle}
          onValueChange={value => {
            settingsStore.set("editorCursorStyle", value as EditorCursorStyle);
          }}
        >
          {CURSOR_STYLES.map(option => (
            <ToggleGroupItem key={option.value} value={option.value}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingField>

      <Separator />

      {SWITCHES.map(item => (
        <SettingField key={item.key} id={item.id} label={item.label} description={item.description} layout="inline">
          <Switch
            aria-labelledby={item.id}
            checked={settings[item.key]}
            onCheckedChange={checked => {
              settingsStore.set(item.key, checked);
            }}
          />
        </SettingField>
      ))}
    </div>
  );
}

/**
 * Prévia do editor com as preferências atuais.
 */
function CodePreview({ fontSize, wordWrap, tabSize }: { fontSize: number; wordWrap: boolean; tabSize: number }) {
  const lines: Array<{ indent: number; parts: Array<[string, string?]> }> = [
    { indent: 0, parts: [["programa", styles.keyword], [" {"]] },
    {
      indent: 1,
      parts: [["funcao", styles.keyword], [" "], ["inicio", styles.function], ["() {"]],
    },
    {
      indent: 2,
      parts: [
        ["escreva", styles.function],
        ["("],
        ['"Olá! Esta linha é comprida para mostrar como a quebra de linha funciona no editor."', styles.string],
        [")"],
      ],
    },
    { indent: 1, parts: [["}"]] },
    { indent: 0, parts: [["}"]] },
  ];

  return (
    <figure className={styles.preview}>
      <figcaption className={styles.previewCaption}>Prévia</figcaption>
      <pre className={styles.previewCode} style={{ fontSize, whiteSpace: wordWrap ? "pre-wrap" : "pre" }}>
        {lines.map((line, index) => (
          <div key={index} style={{ paddingLeft: `${line.indent * tabSize}ch` }}>
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
