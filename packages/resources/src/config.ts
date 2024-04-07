import path from "node:path";

export const baseDir = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "assets");
export const baseHtmlPath = process.env.BASE_HTML_PATH ?? "";
