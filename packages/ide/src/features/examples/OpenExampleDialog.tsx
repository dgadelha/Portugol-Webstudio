import { FileCode2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/Command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAsync } from "@/hooks/useAsync";

import {
  type ExampleEntry,
  fetchExampleCode,
  fetchExamplesIndex,
  flattenExamples,
  stripExampleHeader,
} from "./examplesApi";
import styles from "./OpenExampleDialog.module.css";

interface OpenExampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenExample: (example: { title: string; code: string }) => void;
}

export function OpenExampleDialog({ open, onOpenChange, onOpenExample }: OpenExampleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader className={styles.header}>
          <DialogTitle>Exemplos</DialogTitle>
          <DialogDescription>Busque um exemplo e abra em uma nova aba para editar e executar.</DialogDescription>
        </DialogHeader>

        {/* Montado só enquanto aberto: a lista é buscada a cada abertura. */}
        {open && <ExampleBrowser onOpenExample={onOpenExample} />}
      </DialogContent>
    </Dialog>
  );
}

function ExampleBrowser({ onOpenExample }: Pick<OpenExampleDialogProps, "onOpenExample">) {
  const index = useAsync(signal => fetchExamplesIndex(signal), []);
  const entries = useMemo(() => (index.status === "success" ? flattenExamples(index.data) : []), [index]);
  const [highlighted, setHighlighted] = useState("");

  const groups = useMemo(() => groupByCategory(entries), [entries]);

  if (index.status === "error") {
    return (
      <p className={styles.error}>Não foi possível carregar os exemplos. Verifique a conexão e tente novamente.</p>
    );
  }

  const current = entries.find(entry => entry.item.id === highlighted) ?? entries[0] ?? null;

  return (
    <div className={styles.browser}>
      <Command value={current?.item.id ?? ""} onValueChange={setHighlighted} className={styles.list}>
        <CommandInput placeholder="Buscar exemplos…" />
        <CommandList className={styles.items}>
          {index.status === "loading" ? (
            <ListSkeleton />
          ) : (
            <>
              <CommandEmpty>Nenhum exemplo encontrado.</CommandEmpty>
              {[...groups].map(([category, items]) => (
                <CommandGroup key={category} heading={category}>
                  {items.map(entry => {
                    return (
                      <ExampleCommandItem
                        key={entry.item.id}
                        entry={entry}
                        onOpen={() => void openEntry(entry, onOpenExample)}
                      />
                    );
                  })}
                </CommandGroup>
              ))}
            </>
          )}
        </CommandList>
      </Command>

      <div className={styles.previewArea}>
        {current && <ExamplePreview key={current.item.id} entry={current} onOpenExample={onOpenExample} />}
      </div>
    </div>
  );
}

function groupByCategory(entries: ExampleEntry[]) {
  const groups = new Map<string, ExampleEntry[]>();

  for (const entry of entries) {
    groups.set(entry.category, [...(groups.get(entry.category) ?? []), entry]);
  }

  return groups;
}

function ExampleCommandItem({ entry, onOpen }: { entry: ExampleEntry; onOpen: () => void }) {
  return (
    <CommandItem
      value={entry.item.id}
      keywords={[entry.item.name, entry.category, ...entry.path, entry.item.description ?? ""]}
      onSelect={onOpen}
    >
      <FileCode2 />
      <span className={styles.itemName}>{entry.item.name}</span>
      {entry.path.length > 0 && <span className={styles.itemPath}>{entry.path.join(" › ")}</span>}
    </CommandItem>
  );
}

async function openEntry(entry: ExampleEntry, onOpenExample: OpenExampleDialogProps["onOpenExample"]) {
  onOpenExample({ title: entry.item.name, code: await fetchExampleCode(entry.item) });
}

function ExamplePreview({
  entry,
  onOpenExample,
}: { entry: ExampleEntry } & Pick<OpenExampleDialogProps, "onOpenExample">) {
  const code = useAsync(signal => fetchExampleCode(entry.item, signal), [entry]);

  return (
    <div className={styles.preview}>
      <div className={styles.previewHeader}>
        <div className={styles.previewText}>
          <h3 className={styles.previewTitle}>{entry.item.name}</h3>
          <p className={styles.previewDescription}>
            {entry.item.description || [entry.category, ...entry.path].join(" › ")}
          </p>
        </div>

        <Button
          type="button"
          disabled={code.status !== "success"}
          onClick={() => {
            if (code.status === "success") onOpenExample({ title: entry.item.name, code: code.data });
          }}
        >
          Abrir
        </Button>
      </div>

      <div className={styles.previewCode}>
        <CodeEditor
          language="portugol"
          userSettings={false}
          value={code.status === "success" ? stripExampleHeader(code.data) : ""}
          options={{ readOnly: true, lineNumbers: "off", minimap: { enabled: false }, fontSize: 13 }}
        />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} className={styles.skeletonRow} />
      ))}
    </div>
  );
}
