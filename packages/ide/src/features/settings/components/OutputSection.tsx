import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";

import { outputFontSize, settingsStore } from "../settingsStore";
import { useSettings } from "../useSettings";
import { FontSizeControl } from "./FontSizeControl";
import styles from "./OutputSection.module.css";
import { SettingField } from "./SettingField";

export function OutputSection() {
  const settings = useSettings();
  const followsEditor = settings.outputFontSize === null;

  return (
    <div className={styles.section}>
      <SettingField
        id="setting-output-font-size"
        label="Tamanho da fonte"
        description={
          followsEditor
            ? "Igual ao do editor, até ser alterado aqui."
            : `Próprio da saída. O editor usa ${settings.editorFontSize}px.`
        }
      >
        <FontSizeControl
          labelledBy="setting-output-font-size"
          value={outputFontSize(settings)}
          onChange={size => {
            settingsStore.set("outputFontSize", size);
          }}
        />
        {!followsEditor && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={styles.followEditor}
            onClick={() => {
              settingsStore.set("outputFontSize", null);
            }}
          >
            <RotateCcw />
            Usar o tamanho do editor
          </Button>
        )}
      </SettingField>

      <Separator />

      <SettingField
        id="setting-output-clear-on-run"
        label="Limpar ao executar"
        description="Desativado, a saída de cada execução fica abaixo da anterior."
        layout="inline"
      >
        <Switch
          aria-labelledby="setting-output-clear-on-run"
          checked={settings.outputClearOnRun}
          onCheckedChange={checked => {
            settingsStore.set("outputClearOnRun", checked);
          }}
        />
      </SettingField>

      <SettingField
        id="setting-output-auto-scroll"
        label="Rolar até o fim"
        description="Acompanha a saída conforme o programa escreve. Quando o programa espera uma entrada, a saída sempre vai para o fim."
        layout="inline"
      >
        <Switch
          aria-labelledby="setting-output-auto-scroll"
          checked={settings.outputAutoScroll}
          onCheckedChange={checked => {
            settingsStore.set("outputAutoScroll", checked);
          }}
        />
      </SettingField>
    </div>
  );
}
