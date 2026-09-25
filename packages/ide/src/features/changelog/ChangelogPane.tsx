import { Markdown } from "@/components/Markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CHANGELOG } from "@/lib/changelog";

export function ChangelogPane() {
  return (
    <ScrollArea className="h-full">
      <Markdown source={CHANGELOG} className="mx-auto max-w-2xl px-6 py-10" />
    </ScrollArea>
  );
}
