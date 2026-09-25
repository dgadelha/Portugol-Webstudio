import { fetchJson } from "@/lib/fetch";

import { librariesTopic } from "./librariesTopics";
import type { HelpTopic } from "./types";

export const HELP_BASE_URL = "/assets/recursos/ajuda";

/**
 * Tópicos em HTML do Portugol Studio, seguidos da documentação das bibliotecas.
 */
export async function fetchHelpTopics(signal?: AbortSignal) {
  const topics = await fetchJson<HelpTopic[]>(`${HELP_BASE_URL}/scripts/topicos.json`, signal);

  return [...topics, librariesTopic];
}
