import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

/**
 * SPEC-019 -- reference reimplementation of the backend's canonical algorithm
 * (`CreateSigningRequestCommandHandler.ComputeCanonicalLegHash`, C#). Must reproduce it byte for
 * byte -- see `docs/specs/execution-custody/CANONICAL-HASH-TEST-VECTORS.md` for the full
 * specification and the reference vectors this function is tested against
 * (`canonicalHash.referenceVectors.test.ts`). Never JSON (key order/whitespace/number formatting
 * vary across languages, the classic source of cross-language divergence) -- a fixed string
 * joined by `|`, SHA-256, uppercase hex.
 *
 * @param amount decimal as a string -- formatted to exactly 18 fractional digits, no grouping
 *   (equivalent to `"F18"`/`CultureInfo.InvariantCulture` in C#). Never pass a JS `number` here --
 *   it would lose precision for large values (same rationale as `amount: string` throughout the
 *   rest of the SDK, `SDK_CAPABILITY_SPEC.md §11.1`).
 * @param expiresAt expiration instant -- integer Unix seconds (never ISO-8601, eliminates
 *   timezone/format ambiguity across languages).
 * @returns uppercase hex of the SHA-256 digest of the canonical representation.
 */
export function computeCanonicalHash(
  protocolVersion: number,
  environmentId: string,
  walletId: string,
  derivationReference: number,
  originReference: string,
  assetNetworkId: string,
  sourceAddress: string,
  legRole: string,
  destinationAddress: string,
  amount: string,
  expiresAt: number,
): string {
  const normalized = [
    String(protocolVersion),
    environmentId,
    walletId,
    String(derivationReference),
    originReference,
    assetNetworkId,
    sourceAddress,
    legRole,
    destinationAddress,
    formatAmount(amount),
    String(Math.trunc(expiresAt)),
  ].join('|');

  return bytesToHex(sha256(new TextEncoder().encode(normalized))).toUpperCase();
}

function formatAmount(amount: string): string {
  const negative = amount.startsWith('-');
  const unsigned = negative ? amount.slice(1) : amount;
  const [integerPart = '', fractionalPart = ''] = unsigned.split('.');

  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
    throw new Error(`invalid amount, expected a plain decimal: "${amount}"`);
  }
  if (fractionalPart.length > 18) {
    throw new Error(`amount exceeds 18 fractional digits (the protocol's maximum precision): "${amount}"`);
  }

  const paddedFractional = fractionalPart.padEnd(18, '0');
  return `${negative ? '-' : ''}${integerPart}.${paddedFractional}`;
}
