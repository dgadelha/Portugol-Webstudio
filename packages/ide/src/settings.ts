// https://github.com/microsoft/vscode/blob/2bdb3e9b41bd72048ea2067a350d8536c82fc7f6/src/vs/base/common/platform.ts#L101
const isMacintosh = navigator.userAgent.includes("Macintosh");

// https://github.com/microsoft/vscode/blob/2bdb3e9b41bd72048ea2067a350d8536c82fc7f6/src/vs/editor/common/config/editorOptions.ts#L5387-L5389
export const defaultFontSize = isMacintosh ? 12 : 14;
