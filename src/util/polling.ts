import { TimeoutError } from '../error/errors.js';

/**
 * Shared base for every `waitFor` in the SDK -- never infinite polling, always an explicit
 * `timeoutMs` (see SDK_CAPABILITY_SPEC.md §15).
 */
export async function pollUntil<T>(
  fetch: () => Promise<T>,
  isDone: (result: T) => boolean,
  timeoutMs: number,
  pollIntervalMs: number,
  description: string,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const result = await fetch();
    if (isDone(result)) {
      return result;
    }
    if (Date.now() > deadline) {
      throw new TimeoutError(`waitFor exceeded its ${timeoutMs}ms timeout waiting for ${description}`);
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}
