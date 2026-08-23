import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import {
  CreateTransactionResult,
  ParticipantInput,
  TransactionResponse,
  TransactionStatusResponse,
  mapCreateTransactionResult,
  mapTransactionResponse,
  mapTransactionStatusResponse,
} from '../model/dataPlane.js';
import { TransactionStatus } from '../model/enums.js';
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

  create(
    organizationId: string,
    applicationId: string,
    workflowVersionId: string | null,
    assetNetworkId: string,
    amount: string,
    participants: ParticipantInput[],
    idempotencyKey?: string,
  ): Promise<CreateTransactionResult> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({
      applicationId, workflowVersionId, assetNetworkId, amount: Number(amount), participants, idempotencyKey: key,
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
