// https://github.com/microsoft/vscode/blob/1fe7285a1162756215a684ee702b16d0ce42bdb4/src/vs/base/common/platform.ts#L102
const isMacintosh = navigator.userAgent.includes("Macintosh");

// https://github.com/microsoft/vscode/blob/1fe7285a1162756215a684ee702b16d0ce42bdb4/src/vs/editor/common/config/fontInfo.ts#L240
export const defaultFontSize = isMacintosh ? 12 : 14;

/**
 * Chaves das configurações no `localStorage`.
 */
export enum SettingsKey {
  Theme = "theme",
  EditorFontSize = "editorFontSize",
  EditorWordWrap = "editorWordWrap",
}
