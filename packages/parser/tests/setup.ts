import { PortugolCodeDiagnostic, PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { expect } from "vitest";

expect.addSnapshotSerializer({
  test: value => value instanceof PortugolCodeDiagnostic,

  serialize(value: PortugolCodeDiagnostic) {
    const severityMap: Record<PortugolDiagnosticSeverity, string> = {
      [PortugolDiagnosticSeverity.Error]: "E",
      [PortugolDiagnosticSeverity.Warning]: "W",
      [PortugolDiagnosticSeverity.Information]: "I",
    };

    const code = value.code ? ` [${value.code}]` : "";

    return `${value.startLine}:${value.startCol}/${value.endLine}:${value.endCol} ${severityMap[value.severity]}${code}: ${value.message}`;
  },
});
