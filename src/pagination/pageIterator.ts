/**
 * Async generator lazy sobre um endpoint com paginação real `skip`/`take` — busca a próxima página
 * sob demanda, nunca carrega a coleção inteira de uma vez (regra do brief: "nunca bulk-loading
 * unbounded"). Usado só nos 2 endpoints do SDK com paginação real de verdade (Withdrawals.list,
 * Ledger.listEntries — ver SDK_CAPABILITY_SPEC.md §12.7); todo outro endpoint de listagem devolve
 * um array simples (que já é iterável), sem fingir paginação que a API não tem.
 */
export async function* paginate<T>(
  pageSize: number,
  fetchPage: (skip: number, take: number) => Promise<T[]>,
): AsyncGenerator<T, void, undefined> {
  if (pageSize <= 0) {
    throw new Error('pageSize deve ser positivo');
  }
  let skip = 0;
  for (;;) {
    const page = await fetchPage(skip, pageSize);
    for (const item of page) {
      yield item;
    }
    if (page.length < pageSize) {
      return;
    }
    skip += pageSize;
  }
}
