import { PortugolCodeDiagnostic, PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { expect } from "vitest";

expect.addSnapshotSerializer({
  test(value) {
    return value instanceof PortugolCodeDiagnostic;
  },

  serialize(value: PortugolCodeDiagnostic) {
    const severityMap: Record<PortugolDiagnosticSeverity, string> = {
      [PortugolDiagnosticSeverity.Error]: "E",
      [PortugolDiagnosticSeverity.Warning]: "W",
      [PortugolDiagnosticSeverity.Information]: "I",
    };

    return `${value.startLine}:${value.startCol}/${value.endLine}:${value.endCol} ${severityMap[value.severity]}: ${value.message}`;
  },
});
