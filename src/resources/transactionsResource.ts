import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import {
  CreateTransactionResult,
  ExecutionResponse,
  ParticipantInput,
  TransactionResponse,
  TransactionStatusResponse,
  mapCreateTransactionResult,
  mapExecutionResponse,
  mapTransactionResponse,
  mapTransactionStatusResponse,
} from '../model/dataPlane.js';
import { EnumValue } from '../model/enumFactory.js';
import { TransactionStatus } from '../model/enums.js';
import { paginate } from '../pagination/pageIterator.js';
import { pollUntil } from '../util/polling.js';

const TERMINAL_STATUSES = new Set([
  TransactionStatus.SETTLED!.rawValue,
  TransactionStatus.REFUNDED!.rawValue,
  TransactionStatus.CANCELLED!.rawValue,
]);

/** Data Plane — `Transactions` (7 rotas reais). */
export class TransactionsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  /**
   * DEC-037 -- `environmentId` is explicit and required (never inferred: an Application can have
   * multiple Environments). When authenticated via Application API Key, the backend rejects a
   * mismatch against the key's own bound Environment (cross-environment spoofing protection) --
   * pass the same Environment the key belongs to.
   */
  create(
    organizationId: string,
    applicationId: string,
    environmentId: string,
    workflowVersionId: string | null,
    assetNetworkId: string,
    amount: string,
    participants: ParticipantInput[],
    idempotencyKey?: string,
  ): Promise<CreateTransactionResult> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({
      applicationId, environmentId, workflowVersionId, assetNetworkId, amount: Number(amount), participants, idempotencyKey: key,
    });
    return this.execute(postRequest(`/v1/organizations/${organizationId}/transactions`, body, true), mapCreateTransactionResult);
  }

  get(transactionId: string): Promise<TransactionResponse> {
    return this.execute(getRequest(`/v1/transactions/${transactionId}`), mapTransactionResponse);
  }

  getState(transactionId: string): Promise<TransactionStatusResponse> {
    return this.execute(getRequest(`/v1/transactions/${transactionId}/state`), mapTransactionStatusResponse);
  }

  async reserve(transactionId: string): Promise<{ entryGroupId: string }> {
    return this.execute(postRequest(`/v1/transactions/${transactionId}/reserve`, undefined, true), (raw) => ({
      entryGroupId: String((raw as Record<string, unknown>).entryGroupId),
    }));
  }

  cancel(transactionId: string, reason?: string): Promise<void> {
    const body = this.toJson({ reason: reason ?? '' });
    return this.executeNoContent(postRequest(`/v1/transactions/${transactionId}/cancel`, body, false));
  }

  freeze(transactionId: string, reason?: string): Promise<void> {
    const body = this.toJson({ reason: reason ?? '' });
    return this.executeNoContent(postRequest(`/v1/transactions/${transactionId}/freeze`, body, false));
  }

  unfreeze(transactionId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/transactions/${transactionId}/unfreeze`, undefined, false));
  }

  /**
   * PROMPT 5 §9 (G.7) -- discoverability for outstanding/overdue Executions. The safety rule that
   * makes an Organization settlement-restricted on an overdue Execution stays -- this closes the
   * operational hole of finding which Execution caused it. Never expose cross-tenant --
   * `organizationId` scopes the query, same authorization model as every other
   * `/v1/organizations/{organizationId}/...` route. Remediation for `AwaitingSignature`/`Overdue`
   * is `reserve`/settlement flow (non-custodial model -- there is no cancel path for an Execution).
   */
  searchExecutions(
    organizationId: string,
    options: { status?: EnumValue<number>; transactionId?: string; settlementId?: string; from?: string; to?: string; skip?: number; take?: number } = {},
  ): Promise<ExecutionResponse[]> {
    const query = new URLSearchParams();
    if (options.status) query.set('status', String(options.status.rawValue));
    if (options.transactionId) query.set('transactionId', options.transactionId);
    if (options.settlementId) query.set('settlementId', options.settlementId);
    if (options.from) query.set('from', options.from);
    if (options.to) query.set('to', options.to);
    if (options.skip !== undefined) query.set('skip', String(options.skip));
    if (options.take !== undefined) query.set('take', String(options.take));
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/executions?${query}`), mapExecutionResponse);
  }

  /** Lazy iterator (async generator) -- see SDK_CAPABILITY_SPEC.md §12.7. */
  searchExecutionsAll(
    organizationId: string,
    options: { status?: EnumValue<number>; transactionId?: string; settlementId?: string; from?: string; to?: string },
    pageSize: number,
  ): AsyncGenerator<ExecutionResponse, void, undefined> {
    return paginate(pageSize, (skip, take) => this.searchExecutions(organizationId, { ...options, skip, take }));
  }

  /** Safe polling, never infinite -- ends at Settled/Refunded/Cancelled. */
  waitFor(transactionId: string, timeoutMs: number, pollIntervalMs: number): Promise<TransactionResponse> {
    return pollUntil(
      () => this.get(transactionId),
      (r) => TERMINAL_STATUSES.has(r.status.rawValue),
      timeoutMs,
      pollIntervalMs,
      `transactionId=${transactionId}`,
    );
  }
}
