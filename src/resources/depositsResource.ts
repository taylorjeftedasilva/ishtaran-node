import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import {
  CreatePaymentIntentResult,
  DepositResponse,
  PaymentIntentResponse,
  mapCreatePaymentIntentResult,
  mapDepositResponse,
  mapPaymentIntentResponse,
} from '../model/deposits.js';

/** Data Plane — `Deposits` (3 rotas reais). */
export class DepositsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  /** The real `depositAddress` is only exposed by the dedicated follow-up GET ({@link getPaymentIntent}). */
  createPaymentIntent(
    organizationId: string,
    transactionId: string,
    assetNetworkId: string,
    amount: string,
    expiresAt: string | undefined,
    idempotencyKey?: string,
  ): Promise<CreatePaymentIntentResult> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({ transactionId, assetNetworkId, amount: Number(amount), expiresAt: expiresAt ?? null, idempotencyKey: key });
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/payment-intents`, body, true),
      mapCreatePaymentIntentResult,
    );
  }

  getPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResponse> {
    return this.execute(getRequest(`/v1/payment-intents/${paymentIntentId}`), mapPaymentIntentResponse);
  }

  getDeposit(depositId: string): Promise<DepositResponse> {
    return this.execute(getRequest(`/v1/deposits/${depositId}`), mapDepositResponse);
  }
}
