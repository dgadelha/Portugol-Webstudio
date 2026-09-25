import { History } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useWorkspace, useWorkspaceStore } from "@/features/workspace/useWorkspace";
import { useWorkspaceActions } from "@/features/workspace/workspaceActionsContext";
import { trackEvent } from "@/lib/analytics";

import styles from "./RecentSessions.module.css";

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
    <section aria-labelledby="recent-sessions-title" className={styles.section}>
      <h2 id="recent-sessions-title" className={styles.heading}>
        <History className={styles.headingIcon} />
        Código de sessões anteriores
      </h2>

      <ul className={styles.list}>
        {recoverable.map(workspace => (
          <li key={workspace.id} className={styles.item}>
            <div className={styles.details}>
              <span className={styles.titles}>{workspace.tabTitles.join(", ")}</span>
              <span className={styles.date}>{dateFormat.format(workspace.updatedAt)}</span>
            </div>

            <Button
              type="button"
              size="xs"
              variant="ghost"
              className={styles.discard}
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
