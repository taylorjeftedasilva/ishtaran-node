import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import {
  CreateWithdrawalDestinationResult,
  WithdrawalQuoteResponse,
  WithdrawalResponse,
  mapCreateWithdrawalDestinationResult,
  mapWithdrawalQuoteResponse,
  mapWithdrawalResponse,
} from '../model/dataPlane.js';
import { EnumValue } from '../model/enumFactory.js';
import { WithdrawalStatus } from '../model/enums.js';
import { paginate } from '../pagination/pageIterator.js';
import { pollUntil } from '../util/polling.js';

const TERMINAL_STATUSES = new Set([
  WithdrawalStatus.COMPLETED!.rawValue,
  WithdrawalStatus.REJECTED!.rawValue,
  WithdrawalStatus.CANCELLED!.rawValue,
  WithdrawalStatus.BROADCAST_FAILED!.rawValue,
]);

/**
 * Data Plane -- `Withdrawals` (7 real routes). {@link quote} never writes anything (pure read --
 * see SDK_CAPABILITY_SPEC.md §5); {@link request} always exposes `estimatedNetworkFee`/
 * `estimatedRecipientAmount` in the response, never hiding the Network Fee.
 */
export class WithdrawalsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  quote(
    organizationId: string,
    accountId: string,
    withdrawalDestinationId: string,
    assetNetworkId: string,
    amount: string,
  ): Promise<WithdrawalQuoteResponse> {
    const body = this.toJson({ accountId, withdrawalDestinationId, assetNetworkId, amount: Number(amount) });
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/withdrawals/quote`, body, true),
      mapWithdrawalQuoteResponse,
    );
  }

  createDestination(organizationId: string, address: string, assetNetworkId: string): Promise<CreateWithdrawalDestinationResult> {
    const body = this.toJson({ address, assetNetworkId });
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/withdrawal-destinations`, body, false),
      mapCreateWithdrawalDestinationResult,
    );
  }

  request(
    organizationId: string,
    accountId: string,
    withdrawalDestinationId: string,
    assetNetworkId: string,
    amount: string,
    idempotencyKey?: string,
  ): Promise<WithdrawalResponse> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({ accountId, withdrawalDestinationId, assetNetworkId, amount: Number(amount), idempotencyKey: key });
    return this.execute(postRequest(`/v1/organizations/${organizationId}/withdrawals`, body, true), mapWithdrawalResponse);
  }

  get(withdrawalId: string): Promise<WithdrawalResponse> {
    return this.execute(getRequest(`/v1/withdrawals/${withdrawalId}`), mapWithdrawalResponse);
  }

  /** `skip`/`take` are real pagination (one of the SDK's only 2 endpoints with genuine pagination). */
  list(
    organizationId: string,
    options: { status?: EnumValue<number>; from?: string; to?: string; skip?: number; take?: number } = {},
  ): Promise<WithdrawalResponse[]> {
    const query = new URLSearchParams();
    if (options.status) query.set('status', String(options.status.rawValue));
    if (options.from) query.set('from', options.from);
    if (options.to) query.set('to', options.to);
    if (options.skip !== undefined) query.set('skip', String(options.skip));
    if (options.take !== undefined) query.set('take', String(options.take));
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/withdrawals?${query}`), mapWithdrawalResponse);
  }

  /** Lazy iterator (async generator) -- see SDK_CAPABILITY_SPEC.md §12.7. */
  listAll(
    organizationId: string,
    options: { status?: EnumValue<number>; from?: string; to?: string },
    pageSize: number,
  ): AsyncGenerator<WithdrawalResponse, void, undefined> {
    return paginate(pageSize, (skip, take) => this.list(organizationId, { ...options, skip, take }));
  }

  cancel(withdrawalId: string, reason?: string): Promise<void> {
    const body = this.toJson({ reason: reason ?? '' });
    return this.executeNoContent(postRequest(`/v1/withdrawals/${withdrawalId}/cancel`, body, false));
  }

  retryBroadcast(withdrawalId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/withdrawals/${withdrawalId}/retry-broadcast`, undefined, false));
  }

  /** Safe polling, never infinite -- ends at Completed/Rejected/Cancelled/BroadcastFailed. */
  waitFor(withdrawalId: string, timeoutMs: number, pollIntervalMs: number): Promise<WithdrawalResponse> {
    return pollUntil(
      () => this.get(withdrawalId),
      (r) => TERMINAL_STATUSES.has(r.status.rawValue),
      timeoutMs,
      pollIntervalMs,
      `withdrawalId=${withdrawalId}`,
    );
  }
}
