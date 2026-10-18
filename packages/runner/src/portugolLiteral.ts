import { ExerciseArgument, vectorElementType } from "./exercise.js";
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
