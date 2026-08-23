import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest } from '../http/types.js';
import { BalanceResponse, LedgerEntryResponse, mapBalanceResponse, mapLedgerEntryResponse } from '../model/dataPlane.js';
import { EnumValue } from '../model/enumFactory.js';
import { paginate } from '../pagination/pageIterator.js';

/** Data Plane — `Ledger` (2 rotas reais, ambas leitura). */
export class LedgerResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  getBalance(accountId: string, assetNetworkId: string): Promise<BalanceResponse> {
    return this.execute(getRequest(`/v1/accounts/${accountId}/balance?assetNetworkId=${assetNetworkId}`), mapBalanceResponse);
  }

  /** `skip`/`take` are real pagination (see SDK_CAPABILITY_SPEC.md §12.7). */
  listEntries(
    accountId: string,
    assetNetworkId: string,
    options: { nature?: EnumValue<number>; from?: string; to?: string; skip: number; take: number },
  ): Promise<LedgerEntryResponse[]> {
    const query = new URLSearchParams({ assetNetworkId, skip: String(options.skip), take: String(options.take) });
    if (options.nature) query.set('nature', String(options.nature.rawValue));
    if (options.from) query.set('from', options.from);
    if (options.to) query.set('to', options.to);
    return this.executeList(getRequest(`/v1/accounts/${accountId}/ledger-entries?${query}`), mapLedgerEntryResponse);
  }

  /** Iterador lazy — ver SDK_CAPABILITY_SPEC.md §12.7. */
  listAllEntries(
    accountId: string,
    assetNetworkId: string,
    options: { nature?: EnumValue<number>; from?: string; to?: string },
    pageSize: number,
  ): AsyncGenerator<LedgerEntryResponse, void, undefined> {
    return paginate(pageSize, (skip, take) => this.listEntries(accountId, assetNetworkId, { ...options, skip, take }));
  }
}
