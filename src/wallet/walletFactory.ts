import { HDKey, HARDENED_OFFSET } from '@scure/bip32';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { InMemorySigner } from './signer.js';
import { TRON_BIP44_HARDENED_ACCOUNT, WalletDerivationScheme } from './derivationScheme.js';

const ENTROPY_BITS = 256; // 24 words (BIP39)
const PURPOSE_44H = 44 + HARDENED_OFFSET;
const TRON_COIN_TYPE_195H = 195 + HARDENED_OFFSET;
const ACCOUNT_0H = 0 + HARDENED_OFFSET;

export interface Wallet {
  readonly scheme: WalletDerivationScheme;
  readonly accountExtendedPublicKey: string;
}

/**
 * Result of {@link generate}/{@link restore} -- bundles the PUBLIC {@link Wallet} (safe to
 * register via the API), the ready-to-use {@link InMemorySigner}, and the recovery mnemonic.
 *
 * The mnemonic is NEVER persisted or transmitted by this SDK on its own -- exporting it is
 * always an explicit, local, opt-in action by the integrator (SPEC-018 brief §9: "Secret export:
 * explicit, local, opt-in. Never automatic. Never sent to the API.").
 */
export interface GeneratedWallet {
  readonly wallet: Wallet;
  readonly signer: InMemorySigner;
  readonly mnemonic: string;
}

export function generate(): GeneratedWallet {
  const mnemonic = generateMnemonic(wordlist, ENTROPY_BITS);
  return fromWords(mnemonic, '');
}

export function restore(mnemonic: string, passphrase = ''): GeneratedWallet {
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error('Invalid mnemonic -- BIP39 checksum does not match.');
  }
  return fromWords(mnemonic, passphrase);
}

function fromWords(mnemonic: string, passphrase: string): GeneratedWallet {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  const master = HDKey.fromMasterSeed(seed);
  const account = master.deriveChild(PURPOSE_44H).deriveChild(TRON_COIN_TYPE_195H).deriveChild(ACCOUNT_0H);

  const signer = InMemorySigner.fromAccountKey(account);
  const wallet: Wallet = { scheme: TRON_BIP44_HARDENED_ACCOUNT, accountExtendedPublicKey: signer.accountExtendedPublicKey() };

  return { wallet, signer, mnemonic };
}
