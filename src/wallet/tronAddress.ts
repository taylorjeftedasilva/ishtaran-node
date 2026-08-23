import { HDKey } from '@scure/bip32';
import * as secp from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { base58check } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';

const MAINNET_PREFIX = 0x41;
const base58CheckCodec = base58check(sha256);

/**
 * Derivation of a Tron mainnet address from an extended public key (xpub) -- CKDpub only
 * (non-hardened BIP32), never needs/touches a private key (INV-SC-01). Mirrors
 * `TronAddressDerivationProvider` (backend) field for field -- used by the SDK to independently
 * verify `sourceAddress`/`destinationAddress` before signing (defense in depth).
 *
 * Algorithm: uncompressed secp256k1 public key (65 bytes: 0x04||X(32)||Y(32)) -> strip the 0x04
 * prefix -> Keccak-256 (64-byte input) -> last 20 bytes -> mainnet prefix 0x41 -> Base58Check.
 */
export function deriveTronAddress(accountExtendedPublicKey: string, index: number): string {
  if (!Number.isInteger(index) || index < 0 || index > 0xffffffff) {
    throw new Error('index is outside the range of a non-hardened BIP32 index.');
  }

  const accountKey = HDKey.fromExtendedKey(accountExtendedPublicKey);
  const changeKey = accountKey.deriveChild(0);
  const addressKey = changeKey.deriveChild(index);

  const compressed = addressKey.publicKey;
  if (!compressed) {
    throw new Error('Could not derive the public key at this index.');
  }

  const uncompressed = secp.Point.fromHex(compressed).toRawBytes(false); // 65 bytes: 0x04||X||Y
  const hashInput = uncompressed.slice(1); // strip the 0x04 prefix -> 64 bytes

  const hash = keccak_256(hashInput);
  const last20 = hash.slice(12, 32);

  const payload = new Uint8Array(21);
  payload[0] = MAINNET_PREFIX;
  payload.set(last20, 1);

  return base58CheckCodec.encode(payload);
}
