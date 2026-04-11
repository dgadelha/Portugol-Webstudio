export function portugol(strings: TemplateStringsArray, ...values: any[]): string {
  let code = strings[0];

  for (let i = 0; i < values.length; i++) {
    code += String(values[i]) + strings[i + 1];
  }

  const lines = code.split("\n");

  // Remove leading/trailing empty boundary lines created by the template literal style.
  if (lines[0]?.trim() === "") {
    lines.shift();
  }

  if (lines.at(-1)?.trim() === "") {
    lines.pop();
  }

  // Determine minimal indentation from non-empty lines (starting at 'programa').
  const minIndent = lines.reduce((min, line) => {
    if (!line.trim()) {
      return min;
    }

    const match = line.match(/^[\t ]*/);
    const indentLength = match ? match[0].length : 0;

    return Math.min(min, indentLength);
  }, Number.MAX_SAFE_INTEGER);

  const padding = Number.isFinite(minIndent) ? minIndent : 0;

  return lines.map(line => line.slice(padding)).join("\n");
}

export function portugolInicio(strings: TemplateStringsArray, ...values: any[]): string {
  const code = portugol(strings, ...values);
  return `programa {\n  funcao inicio() {\n    ${code.split("\n").join("\n    ")}\n  }\n}\n`;
}
