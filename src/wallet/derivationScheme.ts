/** Local (SDK-side) derivation strategy identifier -- distinct from `model/enums.ts`'s `DerivationScheme` (wire-format), the same pattern as the backend's Domain/Contracts mirroring. */
export type WalletDerivationScheme = 'TRON_BIP44_HARDENED_ACCOUNT';

export const TRON_BIP44_HARDENED_ACCOUNT: WalletDerivationScheme = 'TRON_BIP44_HARDENED_ACCOUNT';
