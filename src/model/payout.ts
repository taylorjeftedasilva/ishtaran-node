import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { PayoutBatchObligationStatus, PayoutBatchStatus, PayoutBatchTrigger } from './enums.js';

/**
 * SPEC-024 BL-PAY-004/BR-PAY-002 -- "a receber" per beneficiary, never confused with the Account's
 * on-chain (Available) balance. `accrued` = sum of Payable; `reservedForPayout` = sum of open
 * PayoutBatches; `paid` = cumulative delivered history (never confused with Available).
 */
export interface PayableSummaryResponse {
  accrued: string;
  reservedForPayout: string;
  paid: string;
}

export function mapPayableSummaryResponse(raw: unknown): PayableSummaryResponse {
  return {
    accrued: stringFieldOrNull(raw, 'accrued')!,
    reservedForPayout: stringFieldOrNull(raw, 'reservedForPayout')!,
    paid: stringFieldOrNull(raw, 'paid')!,
  };
}

export interface PayoutBatchSourceObligationResponse {
  originReference: string;
  amount: string;
}

function mapPayoutBatchSourceObligationResponse(raw: unknown): PayoutBatchSourceObligationResponse {
  return {
    originReference: stringField(raw, 'originReference'),
    amount: stringFieldOrNull(raw, 'amount')!,
  };
}

export interface PayoutBatchObligationResponse {
  ownerId: string;
  amount: string;
  sourceObligations: PayoutBatchSourceObligationResponse[];
  destinationAddress: string;
  status: EnumValue<number>;
}

function mapPayoutBatchObligationResponse(raw: unknown): PayoutBatchObligationResponse {
  return {
    ownerId: stringFieldOrNull(raw, 'ownerId')!,
    amount: stringFieldOrNull(raw, 'amount')!,
    sourceObligations: arrayField(raw, 'sourceObligations', mapPayoutBatchSourceObligationResponse),
    destinationAddress: stringField(raw, 'destinationAddress'),
    status: PayoutBatchObligationStatus.fromRaw(Number(field(raw, 'status'))),
  };
}

/** SPEC-025 Descoberta 6/7 -- always the frozen copy captured at reservation time, never recomputed/reread on every read. */
export interface NetworkExecutionQuoteSnapshotResponse {
  network: string;
  nativeExecutionCost: string;
  resourceAssetNetworkId: string | null;
  quoteCurrency: string;
  fx: string;
  totalCharged: string;
  authorizedNativeCost: string;
  expiresAt: string;
}

function mapNetworkExecutionQuoteSnapshotResponse(raw: unknown): NetworkExecutionQuoteSnapshotResponse {
  return {
    network: stringField(raw, 'network'),
    nativeExecutionCost: stringFieldOrNull(raw, 'nativeExecutionCost')!,
    resourceAssetNetworkId: stringFieldOrNull(raw, 'resourceAssetNetworkId'),
    quoteCurrency: stringField(raw, 'quoteCurrency'),
    fx: stringFieldOrNull(raw, 'fx')!,
    totalCharged: stringFieldOrNull(raw, 'totalCharged')!,
    authorizedNativeCost: stringFieldOrNull(raw, 'authorizedNativeCost')!,
    expiresAt: stringField(raw, 'expiresAt'),
  };
}

/**
 * SPEC-025 -- a batched payout execution grouping N beneficiary obligations under a single
 * NetworkExecutionQuote. This SDK slice only ever creates batches with `trigger = MANUAL` (the
 * public route accepts no other trigger yet -- THRESHOLD_CROSSED/SCHEDULED exist in the domain
 * but aren't reachable through the public API today).
 */
export interface PayoutBatchResponse {
  payoutBatchId: string;
  organizationId: string;
  environmentId: string;
  assetNetworkId: string;
  trigger: EnumValue<number>;
  status: EnumValue<number>;
  obligations: PayoutBatchObligationResponse[];
  networkExecutionQuoteSnapshot: NetworkExecutionQuoteSnapshotResponse;
  signingRequestId: string | null;
  createdAt: string;
}

export function mapPayoutBatchResponse(raw: unknown): PayoutBatchResponse {
  return {
    payoutBatchId: stringFieldOrNull(raw, 'payoutBatchId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    environmentId: stringFieldOrNull(raw, 'environmentId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    trigger: PayoutBatchTrigger.fromRaw(Number(field(raw, 'trigger'))),
    status: PayoutBatchStatus.fromRaw(Number(field(raw, 'status'))),
    obligations: arrayField(raw, 'obligations', mapPayoutBatchObligationResponse),
    networkExecutionQuoteSnapshot: mapNetworkExecutionQuoteSnapshotResponse(field(raw, 'networkExecutionQuoteSnapshot')),
    signingRequestId: stringFieldOrNull(raw, 'signingRequestId'),
    createdAt: stringField(raw, 'createdAt'),
  };
}

/** `payoutBatchId` is `null` when there were no eligible candidates (204 No Content, a legitimate no-op -- never an error). */
export interface CreatePayoutBatchResult {
  payoutBatchId: string | null;
}
