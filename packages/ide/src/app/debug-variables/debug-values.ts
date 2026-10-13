import type { DebugPause, DebugValue, DebugVariable } from "@portugol-webstudio/runner";

/**
 * O tipo de uma variável como na declaração dela: o de um vetor ou matriz é o dos itens.
 */
export function baseType(value: DebugValue): string {
  if (value.items) {
    const first = value.items[0];

    return first ? baseType(first) : "?";
  }

  return value.type;
}

/**
 * Os tamanhos de um vetor ou matriz como na declaração: `[4]` ou `[2][3]`.
 */
export function dimensions(value: DebugValue) {
  if (value.type === "vetor") {
    return `[${value.items?.length ?? 0}]`;
  }

  if (value.type === "matriz") {
    return `[${value.items?.length ?? 0}][${value.items?.[0]?.items?.length ?? 0}]`;
  }

  return "";
}

/**
 * O valor numa linha só, como num literal do Portugol: `{1, 2, 3}`. Vetores maiores que
 * `limit` terminam em reticências. Para o resumo de uma matriz, veja `summaryText`.
 */
export function valueText(value: DebugValue, limit = 10): string {
  if (value.items) {
    const items = value.items.slice(0, limit).map(item => valueText(item, limit));

    if (value.items.length > limit) {
      items.push("…");
    }

    return `{${items.join(", ")}}`;
  }

  return value.text ?? "sem valor";
}

/**
 * A declaração da variável com o valor inteiro, que dá para colar num programa:
 * `real notas[4] = {7.5, 8.0, 6.5, 9.0}`.
 */
export function declarationText(variable: DebugVariable) {
  const declaration = `${variable.constant ? "const " : ""}${baseType(variable)} ${variable.name}${dimensions(variable)}`;

  return variable.text === null ? declaration : `${declaration} = ${valueText(variable, Infinity)}`;
}

/**
 * O valor numa linha curta, para o resumo de um vetor ou matriz fechado: só as primeiras
 * linhas de uma matriz, com poucos itens cada, para caber numa linha da tela.
 */
export function summaryText(value: DebugValue): string {
  if (value.type !== "matriz") {
    return valueText(value);
  }

  const rows = (value.items ?? []).slice(0, 2).map(row => valueText(row, 4));

  if ((value.items?.length ?? 0) > 2) {
    rows.push("…");
  }

  return `{${rows.join(", ")}}`;
}

/**
 * As variáveis da mesma chamada na pausa anterior. As chamadas vêm da mais recente para a
 * mais antiga: a mesma chamada é a que está na mesma profundidade, contada do fim.
 */
export function previousFrameVariables(pause: DebugPause, previous: DebugPause | null, index: number) {
  if (!previous) {
    return null;
  }

  const depth = pause.frames.length - 1 - index;
  const previousFrame = previous.frames[previous.frames.length - 1 - depth];

  return previousFrame?.name === pause.frames[index]?.name ? previousFrame.variables : null;
}

/**
 * Os dois valores são iguais, item a item nos vetores e matrizes. Para no primeiro que
 * difere, sem montar o texto de um vetor inteiro.
 */
function sameValue(a: DebugValue, b: DebugValue): boolean {
  if (a.items || b.items) {
    return (
      a.items?.length === b.items?.length && (a.items ?? []).every((item, index) => sameValue(item, b.items![index]))
    );
  }

  return a.type === b.type && a.text === b.text;
}

export type VariableChange = { variable: DebugVariable; before: DebugVariable | null };

/**
 * O que mudou de uma pausa para a outra: variáveis novas e valores diferentes. Sem a pausa
 * anterior, nada mudou.
 */
export function variableChanges(variables: DebugVariable[], previous: DebugVariable[] | null): VariableChange[] {
  if (!previous) {
    return [];
  }

  const changes: VariableChange[] = [];

  for (const variable of variables) {
    const before = previous.find(item => item.name === variable.name) ?? null;

    if (!before || !sameValue(before, variable)) {
      changes.push({ variable, before });
    }
  }

  return changes;
}
