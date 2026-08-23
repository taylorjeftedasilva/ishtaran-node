import { describe, expect, it } from 'vitest';
import { generate, restore } from './walletFactory.js';

describe('walletFactory', () => {
  it('generate produces a 24-word mnemonic and a wallet with matching public material', () => {
    const generated = generate();

    expect(generated.mnemonic.trim().split(/\s+/)).toHaveLength(24);
    expect(generated.wallet.scheme).toBe('TRON_BIP44_HARDENED_ACCOUNT');
    expect(generated.wallet.accountExtendedPublicKey).toBe(generated.signer.accountExtendedPublicKey());
    expect(generated.wallet.accountExtendedPublicKey.startsWith('xpub')).toBe(true);
  });

  it('generate twice never produces the same mnemonic', () => {
    const first = generate();
    const second = generate();

    expect(first.mnemonic).not.toBe(second.mnemonic);
    expect(first.wallet.accountExtendedPublicKey).not.toBe(second.wallet.accountExtendedPublicKey);
  });

  it('restore with the same mnemonic reproduces the same accountExtendedPublicKey', () => {
    const original = generate();

    const restored = restore(original.mnemonic);

    expect(restored.wallet.accountExtendedPublicKey).toBe(original.wallet.accountExtendedPublicKey);
  });

  it('restore with a different passphrase produces a different wallet', () => {
    const original = generate();

    const restoredWithPassphrase = restore(original.mnemonic, 'extra-security-word');

    expect(restoredWithPassphrase.wallet.accountExtendedPublicKey).not.toBe(original.wallet.accountExtendedPublicKey);
  });

  it('restore with an invalid mnemonic throws', () => {
    expect(() => restore('not a valid bip39 mnemonic at all')).toThrow();
  });

  it('restore with valid words but an invalid checksum throws', () => {
    const bogusChecksum = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon';
    expect(() => restore(bogusChecksum)).toThrow();
  });
});
