import path from "node:path";
import url from "node:url";

export const baseDir = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "assets");
export const baseHtmlPath = process.env.BASE_HTML_PATH ?? "";
