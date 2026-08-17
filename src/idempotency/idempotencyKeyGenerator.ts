import { randomUUID } from 'node:crypto';

/**
 * Gera a `idempotencyKey` (campo de corpo, ou header em 2 endpoints específicos de
 * OrganizationTenancy — ver SDK_CAPABILITY_SPEC.md §9) quando o consumidor não fornece uma
 * explicitamente. UUID v4 — mesmo formato aceito pelos campos `Guid` reais da API.
 */
export function generateIdempotencyKey(): string {
  return randomUUID();
}

/** Nunca gera uma nova chave se o consumidor já forneceu uma — sobrescrita explícita sempre vence. */
export function resolveIdempotencyKey(explicitKey: string | undefined | null): string {
  return explicitKey && explicitKey.trim() !== '' ? explicitKey : generateIdempotencyKey();
}
