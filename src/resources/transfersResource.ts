import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import { TransferResponse, mapTransferResponse } from '../model/dataPlane.js';

/**
 * PROMPT 7 (SPEC-TRANSFER-001) -- first-class Transfer: Account/Wallet -> asset -> another
 * internal Account or an arbitrary external address, never a Payment/PaymentIntent/Settlement in
 * disguise. Exactly one of `destinationAccountId`/`destinationAddress` must be given -- an
 * external destination never needs to be pre-registered (unlike `withdrawals.createDestination`).
 * Platform Fee (`platformFeeAmount` on the response) is always ON_TOP -- `amount` is exactly what
 * the recipient receives, the fee is charged separately from the sender.
 */
export class TransfersResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  /**
   * The creation endpoint itself only ever acknowledges `{ transferId }` (same convention as
   * every other `POST .../transfers`-shaped route in this platform, e.g. Settlement/Withdrawal) --
   * never the full record. This method does the create, then immediately follows up with
   * {@link get} so the caller receives a genuinely populated `TransferResponse` (status,
   * signingRequestId, platformFeeAmount, ...) in one call, matching what a "create" naturally
   * implies. Found live (2026-09-12): an earlier version mapped the bare `{ transferId }` ack
   * itself through `mapTransferResponse`, silently producing a mostly-null object -- SPEC-TRANSFER-001.
   */
  async request(
    organizationId: string,
    applicationId: string,
    environmentId: string,
    sourceAccountId: string,
    assetNetworkId: string,
    amount: string,
    destination: { accountId: string } | { address: string },
    idempotencyKey?: string,
  ): Promise<TransferResponse> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({
      applicationId,
      environmentId,
      sourceAccountId,
      assetNetworkId,
      amount: Number(amount),
      destinationAccountId: 'accountId' in destination ? destination.accountId : null,
      destinationAddress: 'address' in destination ? destination.address : null,
      idempotencyKey: key,
    });
    const created = await this.execute(postRequest(`/v1/organizations/${organizationId}/transfers`, body, true), (raw) => raw as { transferId: string });
    return this.get(created.transferId);
  }

  get(transferId: string): Promise<TransferResponse> {
    return this.execute(getRequest(`/v1/transfers/${transferId}`), mapTransferResponse);
  }
}
