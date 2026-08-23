import { HDKey } from '@scure/bip32';
import * as secp from '@noble/secp256k1';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { concatBytes, hexToBytes } from '@noble/hashes/utils.js';

// @noble/secp256k1 v2 requires a synchronous HMAC-SHA256 configured explicitly for synchronous
// `sign()` (Node doesn't expose a native synchronous HMAC via WebCrypto) -- configured once here,
// in the module that actually signs, never required from the integrator.
secp.etc.hmacSha256Sync = (key: Uint8Array, ...messages: Uint8Array[]) => hmac(sha256, key, concatBytes(...messages));

/** SPEC-021 -- signs the canonical hash of an `ExecutionLeg` at the given derivation index. The private key never leaves the implementation. */
export interface Signer {
  sign(derivationIndex: number, canonicalHash: Uint8Array): Uint8Array;
}

/**
 * Reference implementation -- keeps the account's private key in plain memory for the lifetime
 * of the process. **Documented as unsafe for Production** (no encryption at rest, no OS
 * protection). Integrators who need real security must implement {@link Signer} against
 * Vault/KMS/HSM/Secret Manager/Keychain -- this SDK never requires a specific backend (SPEC-018
 * brief §8). The private key never leaves this class (never serialized, never logged, never sent
 * to the Ishtaran API -- INV-SC-01).
 */
export class InMemorySigner implements Signer {
  private constructor(private readonly accountKey: HDKey) {}

  static fromAccountKey(accountKey: HDKey): InMemorySigner {
    return new InMemorySigner(accountKey);
  }

  /** Account-level xpub (Base58Check, mainnet -- reused purely as the standard BIP32 serialization, see the equivalent TDR-017). */
  accountExtendedPublicKey(): string {
    return this.accountKey.publicExtendedKey;
  }

  sign(derivationIndex: number, canonicalHash: Uint8Array): Uint8Array {
    if (canonicalHash.length !== 32) {
      throw new Error('canonicalHash must be exactly 32 bytes (SHA-256 digest).');
    }
    if (!Number.isInteger(derivationIndex) || derivationIndex < 0 || derivationIndex > 0xffffffff) {
      throw new Error('derivationIndex is outside the range of a non-hardened BIP32 index.');
    }

    const changeKey = this.accountKey.deriveChild(0);
    const addressKey = changeKey.deriveChild(derivationIndex);
    if (!addressKey.privateKey) {
      throw new Error('Private key unavailable for this index -- accountKey has no private material.');
    }

    // @noble/secp256k1 v2 only produces the compact format (r||s, 64 bytes) -- the real API
    // (`IAddressDerivationProvider.VerifySignature`, backend) expects DER
    // (`NBitcoin.ECDSASignature.FromDER`), so DER is encoded manually here.
    const signature = secp.sign(canonicalHash, addressKey.privateKey);
    return encodeDER(signature.r, signature.s);
  }
}

/** SEQUENCE(INTEGER r, INTEGER s) -- standard DER, the same encoding `ECDSASignature.ToDER()` (NBitcoin)/`ECDSASignature.encodeToDER()` (bitcoinj) produce. */
function encodeDER(r: bigint, s: bigint): Uint8Array {
  const integer = (value: bigint): Uint8Array => {
    let hex = value.toString(16);
    if (hex.length % 2 !== 0) hex = '0' + hex;
    let bytes = hexToBytes(hex);
    if ((bytes[0] ?? 0) & 0x80) {
      bytes = concatBytes(new Uint8Array([0x00]), bytes);
    }
    return concatBytes(new Uint8Array([0x02, bytes.length]), bytes);
  };

  const rEncoded = integer(r);
  const sEncoded = integer(s);
  const body = concatBytes(rEncoded, sEncoded);
  return concatBytes(new Uint8Array([0x30, body.length]), body);
}
