/**
 * A lazy async generator over an endpoint with real `skip`/`take` pagination -- fetches the next
 * page on demand, never loading the entire collection at once (brief rule: "never unbounded
 * bulk-loading"). Used only for the SDK's 2 endpoints with genuinely real pagination
 * (Withdrawals.list, Ledger.listEntries -- see SDK_CAPABILITY_SPEC.md §12.7); every other listing
 * endpoint returns a plain array (already iterable), never faking pagination the API doesn't have.
 */
export async function* paginate<T>(
  pageSize: number,
  fetchPage: (skip: number, take: number) => Promise<T[]>,
): AsyncGenerator<T, void, undefined> {
  if (pageSize <= 0) {
    throw new Error('pageSize must be positive');
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
