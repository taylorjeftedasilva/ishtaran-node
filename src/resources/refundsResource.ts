import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import { ExecuteRefundResult, RefundResponse, mapExecuteRefundResult, mapRefundResponse } from '../model/settlement.js';

/** Data Plane -- `Refunds` (3 real routes, under the same real `Settlement` module). */
export class RefundsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  /** `amount` indefinido = reembolso total. */
  executeRefund(transactionId: string, amount: string | undefined, reason: string | undefined, idempotencyKey?: string): Promise<ExecuteRefundResult> {
    const body = this.toJson({
      amount: amount !== undefined ? Number(amount) : null,
      reason: reason ?? null,
      idempotencyKey: resolveIdempotencyKey(idempotencyKey),
    });
    return this.execute(postRequest(`/v1/transactions/${transactionId}/refunds`, body, true), mapExecuteRefundResult);
  }

  listByTransaction(transactionId: string): Promise<RefundResponse[]> {
    return this.executeList(getRequest(`/v1/transactions/${transactionId}/refunds`), mapRefundResponse);
  }

  get(refundId: string): Promise<RefundResponse> {
    return this.execute(getRequest(`/v1/refunds/${refundId}`), mapRefundResponse);
  }
}
