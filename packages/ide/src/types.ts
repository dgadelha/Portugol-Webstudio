export interface IExtendedWindowApi extends Window {
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
  showSaveFilePicker?: (options: {
    types: Array<{ description: string; accept: Record<string, string[]> }>;
    excludeAcceptAllOption?: boolean;
    suggestedName?: string;
  }) => Promise<FileSystemFileHandle>;
}
