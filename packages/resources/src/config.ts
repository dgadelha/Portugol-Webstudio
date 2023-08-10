import { dirname, join } from "node:path";

export const baseDir = join(dirname(new URL(import.meta.url).pathname), "..", "assets");
export const baseHtmlPath = process.env.BASE_HTML_PATH ?? "";
