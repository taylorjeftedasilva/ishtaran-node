import { TimeoutError } from '../error/errors.js';

/**
 * Base compartilhada de todo `waitFor` do SDK — nunca polling infinito, sempre `timeoutMs`
 * explícito (ver SDK_CAPABILITY_SPEC.md §15).
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
      throw new TimeoutError(`waitFor excedeu o timeout de ${timeoutMs}ms aguardando ${description}`);
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}
