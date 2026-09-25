import { FileCode2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/useAsync";

import {
  type ExampleEntry,
  fetchExampleCode,
  fetchExamplesIndex,
  flattenExamples,
  stripExampleHeader,
} from "./examplesApi";

interface OpenExampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenExample: (example: { title: string; code: string }) => void;
}

export function OpenExampleDialog({ open, onOpenChange, onOpenExample }: OpenExampleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(85vh,640px)] w-[min(92vw,960px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="border-b px-6 py-4">
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
  const current = entries.find(entry => entry.item.id === highlighted) ?? entries[0] ?? null;

  if (index.status === "error") {
    return (
      <p className="m-auto p-6 text-sm text-muted-foreground">
        Não foi possível carregar os exemplos. Verifique a conexão e tente novamente.
      </p>
    );
  }

  return (
    <div className="grid min-h-0 flex-1 md:grid-cols-[320px_1fr]">
      <Command
        value={current?.item.id ?? ""}
        onValueChange={setHighlighted}
        className="min-h-0 rounded-none border-b md:border-r md:border-b-0"
      >
        <CommandInput placeholder="Buscar exemplos…" />
        <CommandList className="max-h-none flex-1">
          {index.status === "loading" ? (
            <ListSkeleton />
          ) : (
            <>
              <CommandEmpty>Nenhum exemplo encontrado.</CommandEmpty>
              {[...groups].map(([category, items]) => (
                <CommandGroup key={category} heading={category}>
                  {items.map(entry => (
                    <ExampleCommandItem
                      key={entry.item.id}
                      entry={entry}
                      onOpen={() => void openEntry(entry, onOpenExample)}
                    />
                  ))}
                </CommandGroup>
              ))}
            </>
          )}
        </CommandList>
      </Command>

      <div className="hidden min-h-0 md:flex">
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
      <span className="truncate">{entry.item.name}</span>
      {entry.path.length > 0 && (
        <span className="ml-auto truncate text-xs text-muted-foreground">{entry.path.join(" › ")}</span>
      )}
    </CommandItem>
  );
}

async function openEntry(entry: ExampleEntry, onOpenExample: OpenExampleDialogProps["onOpenExample"]) {
  onOpenExample({ title: entry.item.name, code: await fetchExampleCode(entry.item) });
}

function ExamplePreview({ entry, onOpenExample }: { entry: ExampleEntry } & Pick<OpenExampleDialogProps, "onOpenExample">) {
  const code = useAsync(signal => fetchExampleCode(entry.item, signal), [entry]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-start gap-4 border-b px-6 py-4">
        <div className="grid min-w-0 flex-1 gap-1">
          <h3 className="truncate font-medium">{entry.item.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
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

      <div className="min-h-0 flex-1">
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
    <div className="grid gap-2 p-3">
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton key={index} className="h-7" />
      ))}
    </div>
  );
}
