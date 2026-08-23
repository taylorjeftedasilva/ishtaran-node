import { describe, expect, it } from 'vitest';
import { generate } from './walletFactory.js';
import { deriveTronAddress } from './tronAddress.js';

describe('deriveTronAddress', () => {
  it('produces a 34-character address starting with T', () => {
    const generated = generate();

    const address = deriveTronAddress(generated.wallet.accountExtendedPublicKey, 0);

    expect(address).toHaveLength(34);
    expect(address.startsWith('T')).toBe(true);
  });

  it('is deterministic — same xpub and index always produce the same address', () => {
    const generated = generate();

    const first = deriveTronAddress(generated.wallet.accountExtendedPublicKey, 7);
    const second = deriveTronAddress(generated.wallet.accountExtendedPublicKey, 7);

    expect(first).toBe(second);
  });

  it('different indices produce different addresses', () => {
    const generated = generate();

    const addressAtZero = deriveTronAddress(generated.wallet.accountExtendedPublicKey, 0);
    const addressAtOne = deriveTronAddress(generated.wallet.accountExtendedPublicKey, 1);

    expect(addressAtZero).not.toBe(addressAtOne);
  });

  it('different wallets produce different addresses at the same index', () => {
    const walletA = generate();
    const walletB = generate();

    const addressA = deriveTronAddress(walletA.wallet.accountExtendedPublicKey, 0);
    const addressB = deriveTronAddress(walletB.wallet.accountExtendedPublicKey, 0);

    expect(addressA).not.toBe(addressB);
  });

  it('rejects a negative index', () => {
    const generated = generate();

    expect(() => deriveTronAddress(generated.wallet.accountExtendedPublicKey, -1)).toThrow();
  });
});
