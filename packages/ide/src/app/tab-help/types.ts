export interface TreeItem {
  id: string;
  text: string;
  href?: string;
  source?: string;
  children?: TreeItem[];
  kind?: "href" | "markdown";
}
