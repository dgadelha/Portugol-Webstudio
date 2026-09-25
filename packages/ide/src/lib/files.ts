import { saveAs } from "file-saver";

/**
 * Detecção e conversão de codificação são pesadas e só servem para abrir e salvar arquivos:
 * ficam fora do bundle inicial.
 */
const loadIconv = () => import("iconv-lite");

/**
 * Lê um arquivo do usuário detectando a codificação: arquivos do Portugol Studio costumam vir em ISO-8859-1.
 */
export async function readTextFile(file: File) {
  const [{ decode }, { detect }] = await Promise.all([loadIconv(), import("jschardet")]);
  const array = new Uint8Array(await file.arrayBuffer());
  let binary = "";

  for (const byte of array) {
    binary += String.fromCodePoint(byte);
  }

  const { encoding, confidence } = detect(binary);

  console.log("Opening", { name: file.name, encoding, confidence });

  return decode(array, encoding || "utf8", { stripBOM: true });
}

export function portugolFileName(title: string) {
  return title.endsWith(".por") ? title : `${title}.por`;
}

/**
 * Monta o arquivo `.por`. No modo de compatibilidade, é gravado em ISO-8859-1, como o Portugol Studio espera.
 */
export async function createPortugolBlob(code: string, as: "text" | "binary", compat = false) {
  const type = as === "binary" ? "application/octet-stream" : "text/plain";

  if (compat) {
    const { encode } = await loadIconv();

    return new Blob([Uint8Array.from(encode(code, "ISO-8859-1"))], { type: `${type}; charset=ISO-8859-1` });
  }

  return new Blob([code], { type });
}

export async function downloadPortugolFile(code: string, title: string, compat = false) {
  saveAs(await createPortugolBlob(code, "binary", compat), portugolFileName(title), { autoBom: false });
}

export async function openPortugolFileInNewTab(code: string, title: string, as: "text" | "binary") {
  const blob = await createPortugolBlob(code, as);
  const file = new File([blob], portugolFileName(title), { type: blob.type });

  window.open(URL.createObjectURL(file), "_blank");
}

interface SaveFilePickerWindow extends Window {
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
  showSaveFilePicker?: (options: {
    types: Array<{ description: string; accept: Record<string, string[]> }>;
    excludeAcceptAllOption?: boolean;
    suggestedName?: string;
  }) => Promise<FileSystemFileHandle>;
}

export const hasSaveFilePicker = "showSaveFilePicker" in window;

/**
 * Salva usando o seletor de arquivos nativo. Devolve `false` quando o usuário cancela.
 */
export async function savePortugolFileWithPicker(code: string, title: string) {
  const picker = (window as SaveFilePickerWindow).showSaveFilePicker;

  if (!picker) {
    return false;
  }

  try {
    const handle = await picker({
      types: [{ description: "Arquivo Portugol", accept: { "application/octet-stream": [".por"] } }],
      excludeAcceptAllOption: true,
      suggestedName: portugolFileName(title),
    });

    const writable = await handle.createWritable();
    await writable.write(await createPortugolBlob(code, "binary"));
    await writable.close();

    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return false;
    }

    throw error;
  }
}
