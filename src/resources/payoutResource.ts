import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import {
  CreatePayoutBatchResult,
  PayableSummaryResponse,
  PayoutBatchResponse,
  mapPayableSummaryResponse,
  mapPayoutBatchResponse,
} from '../model/payout.js';
import { stringFieldOrNull } from './resourceSupport.js';

/**
 * Data Plane -- `Payout` (SPEC-024/SPEC-025). Under `PayoutPolicy.IMMEDIATE` a beneficiary's
 * Payable is settled the same moment as the Settlement itself (no PayoutBatch involved); under a
 * batched policy the beneficiary only has an economic Receivable ({@link getPayableSummary})
 * until a PayoutBatch actually executes. This SDK slice only ever creates batches with
 * `trigger = MANUAL` (the public route accepts no other trigger yet).
 */
export class PayoutResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  getPayableSummary(accountId: string, assetNetworkId: string): Promise<PayableSummaryResponse> {
    return this.execute(
      getRequest(`/v1/accounts/${accountId}/payable-summary?assetNetworkId=${assetNetworkId}`),
      mapPayableSummaryResponse,
    );
  }

  /** `payoutBatchId` is `null` when there were no eligible candidates (204 No Content, a legitimate no-op). */
  async createBatch(
    organizationId: string,
    environmentId: string,
    assetNetworkId: string,
    explicitOwnerIds: string[] | null,
    idempotencyKey?: string,
  ): Promise<CreatePayoutBatchResult> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({ environmentId, assetNetworkId, explicitOwnerIds, idempotencyKey: key });
    const payoutBatchId = await this.executeOptional(
      postRequest(`/v1/organizations/${organizationId}/payout-batches`, body, true),
      (raw) => stringFieldOrNull(raw, 'payoutBatchId')!,
    );
    return { payoutBatchId };
  }

  getBatch(organizationId: string, payoutBatchId: string): Promise<PayoutBatchResponse> {
    return this.execute(
      getRequest(`/v1/organizations/${organizationId}/payout-batches/${payoutBatchId}`),
      mapPayoutBatchResponse,
    );
  }
}
