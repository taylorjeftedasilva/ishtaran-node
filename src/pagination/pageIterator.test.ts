import { describe, expect, it } from 'vitest';
import { paginate } from './pageIterator.js';

async function collect<T>(gen: AsyncGenerator<T, void, undefined>): Promise<T[]> {
  const out: T[] = [];
  for await (const item of gen) {
    out.push(item);
  }
  return out;
}

describe('paginate (SDK_CAPABILITY_SPEC.md §12.7)', () => {
  it('iterates across multiple pages, never fetching all at once', async () => {
    const allItems = Array.from({ length: 25 }, (_, i) => i);
    const fetchCalls: number[] = [];

    const gen = paginate(10, async (skip, take) => {
      fetchCalls.push(skip);
      return allItems.slice(skip, skip + take);
    });

    const collected = await collect(gen);
    expect(collected).toEqual(allItems);
    expect(fetchCalls).toEqual([0, 10, 20]);
  });

  it('empty result never fetches more than one page', async () => {
    const fetchCalls: number[] = [];
    const gen = paginate(10, async (skip) => {
      fetchCalls.push(skip);
      return [];
    });
    expect(await collect(gen)).toEqual([]);
    expect(fetchCalls.length).toBe(1);
  });

  it('exact page-size boundary fetches one extra empty page then stops', async () => {
    const allItems = Array.from({ length: 10 }, (_, i) => i);
    const fetchCalls: number[] = [];
    const gen = paginate(10, async (skip, take) => {
      fetchCalls.push(skip);
      return allItems.slice(skip, skip + take);
    });
    expect(await collect(gen)).toEqual(allItems);
    expect(fetchCalls).toEqual([0, 10]);
  });
});
