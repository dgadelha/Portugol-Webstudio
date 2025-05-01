import type monaco from "monaco-editor";

export const PortugolLanguageExtensionPoint: monaco.languages.ILanguageExtensionPoint = {
  id: "portugol",
  extensions: [".por"],
  aliases: ["Portugol"],
};
