import { describe, expect, it } from 'vitest';
import { computeCanonicalHash } from './canonicalHash.js';

/**
 * SPEC-019/brief §10 ("Create deterministic test vectors shared across the 4 languages") --
 * proves this implementation reproduces the backend's C# reference hashes byte for byte. Inputs
 * and expected hashes come from `docs/specs/execution-custody/CANONICAL-HASH-TEST-VECTORS.md` --
 * the single source of truth. If any of these fail, it's a real cross-language parity bug --
 * never adjust the expected value to make the test pass, fix the algorithm.
 */
describe('computeCanonicalHash reference vectors', () => {
  const ENVIRONMENT_ID = '11111111-1111-1111-1111-111111111111';
  const WALLET_ID = '22222222-2222-2222-2222-222222222222';
  const ASSET_NETWORK_ID = '33333333-3333-3333-3333-333333333333';
  const SOURCE_ADDRESS = 'TSourceAddress1234567890123456';
  const EXPIRES_AT = Math.trunc(new Date('2026-08-22T12:15:00Z').getTime() / 1000);

  it('vector 1 -- Seller leg', () => {
    const hash = computeCanonicalHash(
      1, ENVIRONMENT_ID, WALLET_ID, 5, 'settlement:44444444-4444-4444-4444-444444444444',
      ASSET_NETWORK_ID, SOURCE_ADDRESS, 'Seller', 'TSellerDestinationAddress123456', '90', EXPIRES_AT,
    );
    expect(hash).toBe('4623D19A6CFA8B7D7EA9D53F2E09DD5D98C0B237F980182CE3D74B3D9385CEA7');
  });

  it('vector 2 -- PlatformFee leg', () => {
    const hash = computeCanonicalHash(
      1, ENVIRONMENT_ID, WALLET_ID, 5, 'settlement:44444444-4444-4444-4444-444444444444',
      ASSET_NETWORK_ID, SOURCE_ADDRESS, 'PlatformFee', 'TIshtaranFeeDestinationAddr123', '1', EXPIRES_AT,
    );
    expect(hash).toBe('B11A474993D19ED9D0F97B657134A76931626BD52F6082879395AC54EEF8063B');
  });

  it('vector 3 -- Withdrawal leg', () => {
    const hash = computeCanonicalHash(
      1, ENVIRONMENT_ID, WALLET_ID, 12, 'withdrawal:55555555-5555-5555-5555-555555555555',
      ASSET_NETWORK_ID, SOURCE_ADDRESS, 'Withdrawal', 'TWithdrawalDestinationAddr1234', '250.5', EXPIRES_AT,
    );
    expect(hash).toBe('F297DBED71AA6646D93F489D9B4C2891779D440BC43A39D1820074358AE4F9EA');
  });

  it('vector 4 -- tampered amount produces a different hash, never the original', () => {
    const hash = computeCanonicalHash(
      1, ENVIRONMENT_ID, WALLET_ID, 5, 'settlement:44444444-4444-4444-4444-444444444444',
      ASSET_NETWORK_ID, SOURCE_ADDRESS, 'Seller', 'TSellerDestinationAddress123456', '90.000000000000000001', EXPIRES_AT,
    );
    expect(hash).toBe('4FFA1C26FC90EAFEE081822F4E21AF2DEEA7235F07091DB7CD4C805446770792');
  });
});
