import { vectorElementType } from "./exercise.js";
import type { ExerciseArgument } from "./runners/IPortugolRunner.js";
import { realToString } from "./realToString.js";

// As sequências de escape do Portugol (as mesmas do Java) para os caracteres de controle
const ESCAPES: Record<string, string> = {
  "\b": "\\b",
  "\t": "\\t",
  "\n": "\\n",
  "\r": "\\r",
  "\f": "\\f",
};

/**
 * Um valor como se escreve no código em Portugol: `3`, `"abc"`, `'a'`, `verdadeiro`, com os
 * caracteres especiais escapados (`"a\"b"`). Um vetor (`type` com `[]`, e `value` a lista) fica
 * entre chaves: `{1, 2, 3}`.
 *
 * Um `real` sai como o `escreva` o escreve (`8.0`, `1.0E7`), para bater com a saída. Com
 * `code`, sai como pode ser escrito no código, que não aceita expoente: `10000000.0`.
 */
export function portugolLiteral(type: string, value: unknown, { code = false } = {}): string {
  const element = vectorElementType(type);

  if (element && Array.isArray(value)) {
    return `{${value.map(item => portugolLiteral(element, item, { code })).join(", ")}}`;
  }

  switch (type) {
    case "real": {
      const text = realToString(value as number);

      return code && text.includes("E") ? decimal(value as number) : text;
    }

    case "cadeia": {
      return `"${escape(value as string, '"')}"`;
    }

    case "caracter": {
      return `'${escape(value as string, "'")}'`;
    }

    case "logico": {
      return value ? "verdadeiro" : "falso";
    }

    default: {
      return String(value);
    }
  }
}

/**
 * Uma chamada de função como no código em Portugol: `soma(3, 5)`, `media({1.0, 2.5}, 2)`.
 */
export function portugolCall(name: string, args: ExerciseArgument[]) {
  return `${name}(${args.map(arg => portugolLiteral(arg.tipo, arg.valor, { code: true })).join(", ")})`;
}

/**
 * Uma assinatura como no Portugol, sem os nomes dos parâmetros: `funcao inteiro soma(inteiro,
 * inteiro)`. Sem retorno, fica sem o tipo, como `funcao soma(...)`.
 */
export function portugolSignature(name: string, { parameters, returns }: { parameters: string[]; returns: string }) {
  return `funcao ${returns === "vazio" ? "" : `${returns} `}${name}(${parameters.join(", ")})`;
}

// Um real sem expoente, com todos os dígitos e pelo menos uma casa: 0.0001, 10000000.0
function decimal(value: number) {
  const text = value.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 100 });

  return text.includes(".") ? text : `${text}.0`;
}

function escape(text: string, quote: string) {
  let escaped = "";

  for (const character of text) {
    const code = character.codePointAt(0)!;

    if (character === quote || character === "\\") {
      escaped += `\\${character}`;
    } else if (code < 0x20) {
      escaped += ESCAPES[character] ?? `\\u${code.toString(16).padStart(4, "0")}`;
    } else {
      escaped += character;
    }
  }

  return escaped;
}

// O caminho inverso das sequências de escape: a letra depois da barra e o caractere
const UNESCAPES: Record<string, string> = Object.fromEntries(
  Object.entries(ESCAPES).map(([character, sequence]) => [sequence[1], character]),
);

/**
 * Um valor escrito como no código em Portugol, do tipo pedido (`inteiro`, `real[]`…), ou
 * `undefined` se o texto não for um valor desse tipo. O caminho inverso de `portugolLiteral`
 * com `code`: um vetor entre chaves, cadeias e caracteres entre aspas com as sequências de
 * escape da gramática (`\n`, `\"`, `A`, `\101`…). Um inteiro vale onde se espera um real,
 * como numa chamada.
 */
export function parsePortugolLiteral(text: string, type: string): ExerciseArgument | undefined {
  const trimmed = text.trim();
  const element = vectorElementType(type);

  if (element) {
    const match = /^\{(.*)\}$/s.exec(trimmed);

    if (!match) {
      return undefined;
    }

    const items = splitPortugolList(match[1]);
    const values: unknown[] = [];

    for (const item of items) {
      const parsed = parsePortugolLiteral(item, element);

      if (!parsed) {
        return undefined;
      }

      values.push(parsed.valor);
    }

    return { tipo: type, valor: values } as ExerciseArgument;
  }

  switch (type) {
    case "inteiro": {
      return /^-?\d+$/.test(trimmed) && Number(trimmed) >= -2_147_483_648 && Number(trimmed) <= 2_147_483_647
        ? { tipo: "inteiro", valor: Number(trimmed) }
        : undefined;
    }

    case "real": {
      return /^-?(?:\d+\.?\d*|\.\d+)$/.test(trimmed) ? { tipo: "real", valor: Number(trimmed) } : undefined;
    }

    case "logico": {
      return trimmed === "verdadeiro" || trimmed === "falso"
        ? { tipo: "logico", valor: trimmed === "verdadeiro" }
        : undefined;
    }

    case "cadeia": {
      const valor = unquote(trimmed, '"');

      return valor === undefined ? undefined : { tipo: "cadeia", valor };
    }

    case "caracter": {
      const valor = unquote(trimmed, "'");

      // Um caracter do Portugol é um char do Java, de 16 bits
      return valor?.length === 1 ? { tipo: "caracter", valor } : undefined;
    }

    default: {
      return undefined;
    }
  }
}

/**
 * Os itens separados por vírgula de uma lista de argumentos ou de um vetor (`{1, 2, 3}`), sem
 * separar as vírgulas dentro das aspas nem dentro das chaves. Um texto vazio é uma lista vazia.
 */
export function splitPortugolList(text: string) {
  if (!text.trim()) {
    return [];
  }

  const items: string[] = [];
  let current = "";
  let quote: string | undefined;
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const character = text[i];

    if (quote) {
      current += character;

      if (character === "\\") {
        current += text[++i] ?? "";
      } else if (character === quote) {
        quote = undefined;
      }
    } else if (character === '"' || character === "'") {
      quote = character;
      current += character;
    } else if (character === "{" || character === "}") {
      depth += character === "{" ? 1 : -1;
      current += character;
    } else if (character === "," && depth === 0) {
      items.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  items.push(current);

  return items;
}

/**
 * O texto entre aspas, com as sequências de escape resolvidas, ou `undefined` se não estiver
 * entre as aspas pedidas, tiver uma aspa solta no meio ou uma sequência que a gramática não
 * aceita.
 */
function unquote(text: string, quote: string) {
  if (text.length < 2 || !text.startsWith(quote) || !text.endsWith(quote)) {
    return;
  }

  const body = text.slice(1, -1);
  let value = "";

  for (let i = 0; i < body.length; i++) {
    const character = body[i];

    if (character === quote) {
      return;
    }

    if (character !== "\\") {
      value += character;
      continue;
    }

    const next = body[i + 1];
    const unicode = /^u([\da-f]{4})/i.exec(body.slice(i + 1));
    // Como no Java: até três dígitos, e só até \377
    const octal = /^(?:[0-3][0-7]{2}|[0-7]{1,2})/.exec(body.slice(i + 1));

    if (unicode) {
      value += String.fromCodePoint(Number.parseInt(unicode[1], 16));
      i += unicode[0].length;
    } else if (octal) {
      value += String.fromCodePoint(Number.parseInt(octal[0], 8));
      i += octal[0].length;
    } else if (next === '"' || next === "'" || next === "\\" || Object.hasOwn(UNESCAPES, next ?? "")) {
      value += UNESCAPES[next] ?? next;
      i++;
    } else {
      return;
    }
  }

  return value;
}
