import { Markdown } from "@/components/Markdown";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { CHANGELOG } from "@/lib/changelog";

import styles from "./ChangelogPane.module.css";

export function ChangelogPane() {
  return (
    <ScrollArea className={styles.scroll}>
      <Markdown source={CHANGELOG} className={styles.content} />
    </ScrollArea>
  );
}
