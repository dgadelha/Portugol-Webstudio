/**
 * Executa `run` em cada item, com até `size` execuções ao mesmo tempo: uma termina, a próxima
 * começa. Devolve os resultados na ordem dos itens.
 */
export async function pool<T, R>(items: T[], size: number, run: (item: T, index: number) => Promise<R>) {
  const results: R[] = [];
  let next = 0;

  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;

        results[index] = await run(items[index], index);
      }
    }),
  );

  return results;
}
