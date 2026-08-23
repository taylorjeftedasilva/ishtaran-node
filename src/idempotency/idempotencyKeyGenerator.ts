import { randomUUID } from 'node:crypto';

/**
 * Generates the `idempotencyKey` (a body field, or a header on 2 specific OrganizationTenancy
 * endpoints -- see SDK_CAPABILITY_SPEC.md §9) when the caller doesn't supply one explicitly.
 * UUID v4 -- the same format the API's real `Guid` fields accept.
 */
export function generateIdempotencyKey(): string {
  return randomUUID();
}

/** Never generates a new key if the caller already supplied one -- an explicit override always wins. */
export function resolveIdempotencyKey(explicitKey: string | undefined | null): string {
  return explicitKey && explicitKey.trim() !== '' ? explicitKey : generateIdempotencyKey();
}
