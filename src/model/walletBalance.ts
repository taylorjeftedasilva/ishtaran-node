import { boolField, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';

/**
 * Ishtaran Wallet Balance / On-Chain Balance capability (PROMPT 1) -- the wallet's own on-chain
 * balance, NEVER the Ledger (`LedgerResource.getBalance`). `walletId` throughout this SDK surface
 * is `accountId`: `ExecutionDestination` (the registered self-custody address) is already the
 * platform's real 1:1 (accountId, assetNetworkId) -> address source of truth, so no separate
 * "wallet registration" concept was introduced -- see WalletBalanceResource's own doc.
 */
export interface WalletBalanceResult {
  accountId: string;
  assetNetworkId: string;
  address: string;
  balance: string;
  /** Null if this wallet has never been successfully observed yet -- balance is 0 in that case, never a lie. */
  observedAt: string | null;
  blockReference: string | null;
  /** "sandbox" | "trongrid" | etc -- whichever provider actually answered, reported honestly by the adapter itself. */
  source: string | null;
  /** True if `observedAt` is null or older than the platform's freshness window (currently 30s). */
  stale: boolean;
  /** When a new refresh call becomes eligible again -- null if none has ever been attempted. */
  nextRefreshAllowedAt: string | null;
  /** True if a `refreshBalance` call was suppressed by the freshness window or single-flight guard -- never an error, the response above is still the latest known value. */
  refreshSuppressed: boolean;
  /** Set only when the most recent refresh attempt failed (timeout/unsupported network/etc) -- the balance/observedAt above remain the last successfully observed values, never zeroed out by a failed refresh. */
  refreshFailureReason: string | null;
}

export function mapWalletBalanceResult(raw: unknown): WalletBalanceResult {
  return {
    accountId: stringField(raw, 'accountId'),
    assetNetworkId: stringField(raw, 'assetNetworkId'),
    address: stringField(raw, 'address'),
    // decimal on the wire -- a raw JSON number, never a string; stringFieldOrNull coerces losslessly (same convention as mapBalanceResponse's `available`/`pending`/`reserved`).
    balance: stringFieldOrNull(raw, 'balance')!,
    observedAt: stringFieldOrNull(raw, 'observedAt'),
    blockReference: stringFieldOrNull(raw, 'blockReference'),
    source: stringFieldOrNull(raw, 'source'),
    stale: boolField(raw, 'stale'),
    nextRefreshAllowedAt: stringFieldOrNull(raw, 'nextRefreshAllowedAt'),
    refreshSuppressed: boolField(raw, 'refreshSuppressed'),
    refreshFailureReason: stringFieldOrNull(raw, 'refreshFailureReason'),
  };
}

export interface WalletNetworkBalanceResult {
  assetNetworkId: string;
  networkCode: string;
  balance: string;
  observedAt: string | null;
  stale: boolean;
}

/** A single Asset's balance aggregated across the AssetNetworks the caller asked about -- never summed across different Assets (e.g. USDT never added to ETH). */
export interface WalletAssetBalanceResult {
  assetId: string;
  assetSymbol: string;
  aggregateBalance: string;
  networkBalances: WalletNetworkBalanceResult[];
}

function mapWalletNetworkBalanceResult(raw: unknown): WalletNetworkBalanceResult {
  return {
    assetNetworkId: stringField(raw, 'assetNetworkId'),
    networkCode: stringField(raw, 'networkCode'),
    balance: stringFieldOrNull(raw, 'balance')!,
    observedAt: stringFieldOrNull(raw, 'observedAt'),
    stale: boolField(raw, 'stale'),
  };
}

export function mapWalletAssetBalanceResult(raw: unknown): WalletAssetBalanceResult {
  const networkBalancesRaw = (raw as { networkBalances?: unknown[] }).networkBalances ?? [];
  return {
    assetId: stringField(raw, 'assetId'),
    assetSymbol: stringField(raw, 'assetSymbol'),
    aggregateBalance: stringFieldOrNull(raw, 'aggregateBalance')!,
    networkBalances: networkBalancesRaw.map(mapWalletNetworkBalanceResult),
  };
}
