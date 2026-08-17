import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import {
  ExecuteSettlementResult,
  SettlementResponse,
  TransactionSettlementSummaryResponse,
  mapExecuteSettlementResult,
  mapSettlementResponse,
  mapTransactionSettlementSummaryResponse,
} from '../model/settlement.js';

/** Data Plane — `Settlement` (5 rotas reais; Refunds em {@link RefundsResource}). */
export class SettlementsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  executeSettlement(transactionId: string, idempotencyKey?: string): Promise<ExecuteSettlementResult> {
    const body = this.toJson({ idempotencyKey: resolveIdempotencyKey(idempotencyKey) });
    return this.execute(postRequest(`/v1/transactions/${transactionId}/settlements`, body, true), mapExecuteSettlementResult);
  }

  listByTransaction(transactionId: string): Promise<SettlementResponse[]> {
    return this.executeList(getRequest(`/v1/transactions/${transactionId}/settlements`), mapSettlementResponse);
  }

  get(settlementId: string): Promise<SettlementResponse> {
    return this.execute(getRequest(`/v1/settlements/${settlementId}`), mapSettlementResponse);
  }

  getSummary(transactionId: string): Promise<TransactionSettlementSummaryResponse> {
    return this.execute(getRequest(`/v1/transactions/${transactionId}/settlement-summary`), mapTransactionSettlementSummaryResponse);
  }

  releaseRetainedSplit(settlementId: string, allocationId: string, idempotencyKey?: string): Promise<void> {
    const body = this.toJson({ idempotencyKey: resolveIdempotencyKey(idempotencyKey) });
    return this.executeNoContent(
      postRequest(`/v1/settlements/${settlementId}/split-allocations/${allocationId}/release`, body, true),
    );
  }
}
