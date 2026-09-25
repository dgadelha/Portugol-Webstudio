import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspace, useWorkspaceStore } from "@/features/workspace/useWorkspace";
import { useWorkspaceActions } from "@/features/workspace/workspaceActionsContext";
import { trackEvent } from "@/lib/analytics";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/**
 * Código de janelas fechadas que esta sessão não adotou automaticamente.
 */
export function RecentSessions() {
  const store = useWorkspaceStore();
  const recoverable = useWorkspace(state => state.recoverable);
  const { goToTab } = useWorkspaceActions();

  if (recoverable.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recent-sessions-title" className="grid gap-2">
      <h2 id="recent-sessions-title" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <History className="size-3.5" />
        Código de sessões anteriores
      </h2>

      <ul className="divide-y rounded-lg border">
        {recoverable.map(workspace => (
          <li key={workspace.id} className="flex items-center gap-3 px-3 py-2">
            <div className="grid min-w-0 flex-1">
              <span className="truncate text-sm font-medium">{workspace.tabTitles.join(", ")}</span>
              <span className="text-xs text-muted-foreground">{dateFormat.format(workspace.updatedAt)}</span>
            </div>

            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => {
                store.discard(workspace.id);
                trackEvent("workspace_discard", "Aba Inicial", "Descartar código de uma sessão anterior");
              }}
            >
              Descartar
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => {
                const restored = store.recover(workspace.id);

                trackEvent(
                  "workspace_recover",
                  "Aba Inicial",
                  "Recuperar código de uma sessão anterior",
                  restored.length,
                );
                if (restored[0]) goToTab(restored[0]);
              }}
            >
              Restaurar
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
