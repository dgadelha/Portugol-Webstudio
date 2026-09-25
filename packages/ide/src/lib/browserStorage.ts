/**
 * `localStorage` pode existir e ainda assim falhar (modo privado, cota zerada, armazenamento bloqueado
 * por política), então só aceitamos um storage depois de escrever e ler de volta.
 */
export function usableStorage(get: () => Storage): Storage | null {
  try {
    const storage = get();
    const probe = "pws:probe";

    storage.setItem(probe, "1");
    const works = storage.getItem(probe) === "1";
    storage.removeItem(probe);

    return works ? storage : null;
  } catch {
    return null;
  }
}

/**
 * Storage em memória para quando o navegador não deixa gravar nada: a sessão funciona, só não persiste.
 */
export function memoryStorage(): Storage {
  const memory = new Map<string, string>();

  return {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => {
      memory.set(key, String(value));
    },
    removeItem: key => {
      memory.delete(key);
    },
    clear: () => {
      memory.clear();
    },
    key: index => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  };
}
