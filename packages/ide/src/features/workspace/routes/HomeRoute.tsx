import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import { pathForTab } from "../tabPaths";
import { useWorkspaceStore } from "../useWorkspace";

/**
 * `/` — a aba inicial. Na primeira visita da sessão, reabre a aba em que o usuário estava.
 */
export function HomeRoute() {
  const store = useWorkspaceStore();
  const [resumeTab] = useState(() => store.consumeBootActiveTab());

  useEffect(() => {
    if (!resumeTab) {
      store.setActiveTab(null);
    }
  }, [store, resumeTab]);

  return resumeTab ? <Navigate to={pathForTab(resumeTab)} replace /> : null;
}
