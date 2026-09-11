import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import {
  WalletAssetBalanceResult,
  WalletBalanceResult,
  mapWalletAssetBalanceResult,
  mapWalletBalanceResult,
} from '../model/walletBalance.js';

/**
 * Ishtaran Wallet Balance / On-Chain Balance capability (PROMPT 1). The wallet's own on-chain
 * balance -- NEVER the Ledger (`LedgerResource.getBalance`, a fundamentally different question:
 * "what does Ishtaran's own accounting say" vs "how many tokens actually sit at this address").
 * `accountId` is the walletId throughout -- `ExecutionDestination` already ties one Account to one
 * registered self-custody address per AssetNetwork, so no separate wallet-registration concept
 * exists (a distinct `WalletsResource` already exists for ExecutionCustody's own execution/signing
 * wallets -- an unrelated concept, deliberately not reused here to avoid confusing the two).
 *
 * `getBalance` is always cheap -- it never calls a blockchain/RPC provider, only returns the last
 * known snapshot. Call `refreshBalance` to request a real, authoritative check; the platform
 * enforces its own freshness window (currently 30s) and single-flight guard server-side, so
 * calling it more often than needed is always safe (never causes extra provider cost, never an
 * error) -- check `refreshSuppressed`/`stale`/`nextRefreshAllowedAt` on the result rather than
 * polling blindly.
 */
export class WalletBalanceResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  getBalance(accountId: string, environmentId: string, assetNetworkId: string): Promise<WalletBalanceResult> {
    const query = new URLSearchParams({ environmentId, assetNetworkId });
    return this.execute(getRequest(`/v1/accounts/${accountId}/wallet-balances?${query}`), mapWalletBalanceResult);
  }

  /** Never informs what the new balance should be -- only asks the platform to check, authoritatively, itself. */
  refreshBalance(accountId: string, environmentId: string, assetNetworkId: string): Promise<WalletBalanceResult> {
    const query = new URLSearchParams({ environmentId, assetNetworkId });
    return this.execute(postRequest(`/v1/accounts/${accountId}/wallet-balances/refresh?${query}`, undefined, false), mapWalletBalanceResult);
  }

  /**
   * Aggregates balance across the given AssetNetworks, grouped by Asset (e.g. USDT total across
   * TRON + Ethereum) -- `assetNetworkIds` are candidates the caller already knows about (from
   * `assetNetworkCatalog.listAssetNetworks`, say); any candidate this Account has no registered
   * address for is simply omitted from the result, never an error.
   */
  getAssetBalances(accountId: string, environmentId: string, assetNetworkIds: string[]): Promise<WalletAssetBalanceResult[]> {
    const query = new URLSearchParams({ environmentId, assetNetworkIds: assetNetworkIds.join(',') });
    return this.executeList(getRequest(`/v1/accounts/${accountId}/wallet-balances/aggregate?${query}`), mapWalletAssetBalanceResult);
  }
}
