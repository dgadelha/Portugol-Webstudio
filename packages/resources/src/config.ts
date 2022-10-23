import { join } from "path";

export const baseDir = join(__dirname, "..", "assets");
export const baseHtmlPath = process.env.BASE_HTML_PATH ?? "";
