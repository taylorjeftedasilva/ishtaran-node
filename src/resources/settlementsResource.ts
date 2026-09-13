import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import { EnumValue } from '../model/enumFactory.js';
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

  /**
   * `amount` omitido/undefined -- liquida todo o remaining reservado (comportamento histórico,
   * inalterado). `amount` informado -- liquida exatamente esse valor (BL-STL-008, ativado
   * 2026-08-26 -- ver ExecuteSettlementRequest.cs), respeitando as mesmas invariantes do total
   * (> 0, <= remaining, precisão do Asset, faixa do Asset Network). Pode ser chamado várias vezes
   * sobre a mesma Transaction até `remainingReservedAmount` chegar a zero -- cada chamada calcula
   * seu próprio Fee sobre o Gross daquela chamada, nunca sobre o total original.
   */
  /**
   * PROMPT 7 (SPEC-TRANSFER-001) -- `operationType` selects which PricingPolicy rate applies
   * (default `OperationType.MARKETPLACE`, 100% backward compatible -- never inferred from the
   * Transaction's own shape). Pass `OperationType.PAYMENT` for a simple 2-party payment (0.40%),
   * leave it unset for a marketplace/split settlement (0.90%).
   */
  executeSettlement(transactionId: string, amount?: string, idempotencyKey?: string, operationType?: EnumValue<number>): Promise<ExecuteSettlementResult> {
    const body = this.toJson({
      idempotencyKey: resolveIdempotencyKey(idempotencyKey),
      amount: amount !== undefined ? Number(amount) : null,
      operationType: operationType ? operationType.rawValue : undefined,
    });
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
