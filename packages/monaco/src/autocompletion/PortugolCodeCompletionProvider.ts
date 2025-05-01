import * as monaco from "monaco-editor";
import { PortugolBasicCompletions } from "./PortugolBasicCompletions";

/**
 * A provider of code completions for the Portugol language.
 */
export class PortugolCodeCompletionProvider implements monaco.languages.CompletionItemProvider {
  public provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.CompletionContext,
    _token: monaco.CancellationToken,
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const textUntilPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    const [keyword] = textUntilPosition.split(":").map(x => x.trim());
    const suggestions = PortugolBasicCompletions.filter(
      x => typeof x.label === "string" && x.label.startsWith(keyword),
    );

    if (suggestions.length > 0) {
      return {
        suggestions: suggestions.map(
          (suggestion: Partial<monaco.languages.CompletionItem>) =>
            ({
              ...suggestion,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column - keyword.length,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            }) as monaco.languages.CompletionItem,
        ),
      };
    }

    return {
      suggestions: [],
    };
  }
}
