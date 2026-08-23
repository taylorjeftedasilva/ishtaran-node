import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { HDKey } from '@scure/bip32';
import * as secp from '@noble/secp256k1';
import { generate } from './walletFactory.js';

function sha256Of(value: string): Uint8Array {
  return new Uint8Array(createHash('sha256').update(value).digest());
}

/** Derives the same PUBLIC address key that {@link InMemorySigner#sign} uses PRIVATELY, from the xpub alone -- proves verification never needs the private key. */
function addressPublicKeyFor(accountExtendedPublicKey: string, index: number): Uint8Array {
  const accountKey = HDKey.fromExtendedKey(accountExtendedPublicKey);
  const changeKey = accountKey.deriveChild(0);
  const addressKey = changeKey.deriveChild(index);
  if (!addressKey.publicKey) throw new Error('publicKey unavailable');
  return addressKey.publicKey;
}

/** @noble/secp256k1 v2 only understands the compact format -- decodes the DER that `InMemorySigner.sign` produces back to (r, s), just for this test. */
function decodeDerSignature(der: Uint8Array): InstanceType<typeof secp.Signature> {
  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('Invalid DER: expected SEQUENCE');
  offset++; // total length, unused
  const readInteger = (): bigint => {
    if (der[offset++] !== 0x02) throw new Error('Invalid DER: expected INTEGER');
    const length = der[offset++]!;
    const bytes = der.slice(offset, offset + length);
    offset += length;
    let value = 0n;
    for (const byte of bytes) value = (value << 8n) | BigInt(byte);
    return value;
  };
  const r = readInteger();
  const s = readInteger();
  return new secp.Signature(r, s);
}

function verifyDer(hash: Uint8Array, derSignature: Uint8Array, publicKey: Uint8Array): boolean {
  const signature = decodeDerSignature(derSignature);
  return secp.verify(signature, hash, publicKey);
}

describe('InMemorySigner', () => {
  it('sign produces a signature that verifies against the corresponding public key', () => {
    const generated = generate();
    const hash = sha256Of('canonical-hash-placeholder');

    const derSignature = generated.signer.sign(3, hash);

    const publicKey = addressPublicKeyFor(generated.wallet.accountExtendedPublicKey, 3);
    expect(verifyDer(hash, derSignature, publicKey)).toBe(true);
  });

  it('signature does not verify against a different derivation index', () => {
    const generated = generate();
    const hash = sha256Of('canonical-hash-placeholder');

    const derSignature = generated.signer.sign(3, hash);

    const wrongPublicKey = addressPublicKeyFor(generated.wallet.accountExtendedPublicKey, 4);
    expect(verifyDer(hash, derSignature, wrongPublicKey)).toBe(false);
  });

  it('signature does not verify against a tampered hash', () => {
    const generated = generate();
    const hash = sha256Of('canonical-hash-placeholder');
    const tamperedHash = sha256Of('canonical-hash-placeholder-tampered');

    const derSignature = generated.signer.sign(3, hash);

    const publicKey = addressPublicKeyFor(generated.wallet.accountExtendedPublicKey, 3);
    expect(verifyDer(tamperedHash, derSignature, publicKey)).toBe(false);
  });

  it('rejects a hash that is not 32 bytes', () => {
    const generated = generate();
    expect(() => generated.signer.sign(0, new Uint8Array([1, 2, 3]))).toThrow();
  });

  it('rejects a negative derivation index', () => {
    const generated = generate();
    const hash = sha256Of('canonical-hash-placeholder');
    expect(() => generated.signer.sign(-1, hash)).toThrow();
  });

  it('accountExtendedPublicKey never contains private key material', () => {
    const generated = generate();

    expect(generated.wallet.accountExtendedPublicKey.startsWith('xpub')).toBe(true);
    expect(generated.wallet.accountExtendedPublicKey.includes('xprv')).toBe(false);
  });
});
