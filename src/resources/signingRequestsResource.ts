import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import {
  CreateSigningRequestResult,
  ExecutionLegInput,
  SigningRequestResponse,
  SubmitSignedTransactionResult,
  mapCreateSigningRequestResult,
  mapSigningRequestResponse,
  mapSubmitSignedTransactionResult,
} from '../model/executionCustody.js';

/**
 * Data Plane -- `ExecutionCustody` SigningRequests (SPEC-019/020/021, checkpoint 8). The SDK
 * never computes the canonical hash on create -- the backend computes it and returns it on
 * {@link get}; the SDK only signs it locally (`wallet/signer.js`) and submits it back.
 */
export class SigningRequestsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  create(
    environmentId: string,
    walletId: string,
    derivationReference: number,
    originReference: string,
    assetNetworkId: string,
    sourceAddress: string,
    legs: ExecutionLegInput[],
    expiresAt: string,
    idempotencyKey?: string,
  ): Promise<CreateSigningRequestResult> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({
      walletId,
      derivationReference,
      originReference,
      assetNetworkId,
      sourceAddress,
      legs: legs.map((leg) => ({ role: leg.role, destinationAddress: leg.destinationAddress, amount: Number(leg.amount) })),
      expiresAt,
      idempotencyKey: key,
    });
    return this.execute(
      postRequest(`/v1/environments/${environmentId}/signing-requests`, body, true),
      mapCreateSigningRequestResult,
    );
  }

  get(signingRequestId: string): Promise<SigningRequestResponse> {
    return this.execute(getRequest(`/v1/signing-requests/${signingRequestId}`), mapSigningRequestResponse);
  }

  /**
   * SPEC-020/INV-SC-03 -- `submittedCanonicalHash` must be exactly the `canonicalHash` returned
   * by {@link get} for that Leg (compared byte for byte by the backend before verifying the
   * signature, fail fast). `signatureHex` is the output of `Signer.sign(...)`, uppercase hex.
   */
  submitSignedTransaction(
    signingRequestId: string,
    executionLegId: string,
    submittedCanonicalHash: string,
    signatureHex: string,
  ): Promise<SubmitSignedTransactionResult> {
    const body = this.toJson({ submittedCanonicalHash, signature: signatureHex });
    return this.execute(
      postRequest(`/v1/signing-requests/${signingRequestId}/legs/${executionLegId}/submit`, body, false),
      mapSubmitSignedTransactionResult,
    );
  }
}
