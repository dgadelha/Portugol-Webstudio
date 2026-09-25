import type { Monaco } from "@/lib/monaco/types";
import { type IPortugolCodeDiagnostic, PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import type { editor } from "monaco-editor";

/**
 * Marca no editor os erros e avisos encontrados pelo checker.
 */
export function applyDiagnostics(monaco: Monaco, model: editor.ITextModel, diagnostics: IPortugolCodeDiagnostic[]) {
  const severity: Record<PortugolDiagnosticSeverity, number> = {
    [PortugolDiagnosticSeverity.Error]: monaco.MarkerSeverity.Error,
    [PortugolDiagnosticSeverity.Warning]: monaco.MarkerSeverity.Warning,
    [PortugolDiagnosticSeverity.Information]: monaco.MarkerSeverity.Info,
  };

  monaco.editor.setModelMarkers(
    model,
    "owner",
    diagnostics.map(diagnostic => ({
      startLineNumber: diagnostic.startLine,
      startColumn: diagnostic.startCol + 1,
      endLineNumber: diagnostic.endLine,
      endColumn: diagnostic.endCol + 2,
      message: diagnostic.message,
      severity: severity[diagnostic.severity] ?? monaco.MarkerSeverity.Error,
    })),
  );
}
