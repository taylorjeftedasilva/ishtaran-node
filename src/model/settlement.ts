import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { RefundStatus, SettlementStatus, SplitAllocationStatus, SplitRetentionReason } from './enums.js';

export interface SettlementSplitAllocationResponse {
  splitAllocationId: string;
  participantId: string;
  accountId: string;
  amount: string;
  status: EnumValue<number>;
  retentionReason: EnumValue<number> | null;
  releasedAt: string | null;
}

function mapSplitAllocation(raw: unknown): SettlementSplitAllocationResponse {
  const retentionReasonRaw = field(raw, 'retentionReason');
  return {
    splitAllocationId: stringFieldOrNull(raw, 'splitAllocationId')!,
    participantId: stringFieldOrNull(raw, 'participantId')!,
    accountId: stringFieldOrNull(raw, 'accountId')!,
    amount: stringFieldOrNull(raw, 'amount')!,
    status: SplitAllocationStatus.fromRaw(Number(field(raw, 'status'))),
    retentionReason: retentionReasonRaw === null || retentionReasonRaw === undefined
      ? null
      : SplitRetentionReason.fromRaw(Number(retentionReasonRaw)),
    releasedAt: stringFieldOrNull(raw, 'releasedAt'),
  };
}

export interface SettlementResponse {
  settlementId: string;
  transactionId: string;
  organizationId: string;
  applicationId: string;
  assetNetworkId: string;
  grossAmount: string;
  platformFeeAmount: string;
  distributableAmount: string;
  feePercentageApplied: string;
  platformRevenueAccountId: string;
  pricingPolicyId: string;
  status: EnumValue<number>;
  entryGroupId: string | null;
  /** DEC-037 -- populated only under SelfCustody, once SelfCustodySettlementExecutionStrategy creates a real SigningRequest (never under ManagedCustody, never before there's something to sign). Fetch it via `signingRequests.get(signingRequestId)` to sign locally. Compatibility field -- always the first entry of {@link signingRequestIds} (or `null`); for a Settlement with more than one physical funding source, prefer `signingRequestIds`. */
  signingRequestId: string | null;
  /** SPEC-ADDRESSPOOL-001 (multi-source funding) -- one SigningRequest per physical funding source frozen for this Settlement; usually a single entry, more than one only when the underlying Transaction was funded by more than one confirmed deposit address. */
  signingRequestIds: string[];
  splitAllocations: SettlementSplitAllocationResponse[];
  createdAt: string;
  executedAt: string | null;
}

export function mapSettlementResponse(raw: unknown): SettlementResponse {
  return {
    settlementId: stringFieldOrNull(raw, 'settlementId')!,
    transactionId: stringFieldOrNull(raw, 'transactionId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    applicationId: stringFieldOrNull(raw, 'applicationId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    grossAmount: stringFieldOrNull(raw, 'grossAmount')!,
    platformFeeAmount: stringFieldOrNull(raw, 'platformFeeAmount')!,
    distributableAmount: stringFieldOrNull(raw, 'distributableAmount')!,
    feePercentageApplied: stringFieldOrNull(raw, 'feePercentageApplied')!,
    platformRevenueAccountId: stringFieldOrNull(raw, 'platformRevenueAccountId')!,
    pricingPolicyId: stringFieldOrNull(raw, 'pricingPolicyId')!,
    status: SettlementStatus.fromRaw(Number(field(raw, 'status'))),
    entryGroupId: stringFieldOrNull(raw, 'entryGroupId'),
    signingRequestId: stringFieldOrNull(raw, 'signingRequestId'),
    signingRequestIds: arrayField(raw, 'signingRequestIds', (item) => String(item)),
    splitAllocations: arrayField(raw, 'splitAllocations', mapSplitAllocation),
    createdAt: stringField(raw, 'createdAt'),
    executedAt: stringFieldOrNull(raw, 'executedAt'),
  };
}

export interface RefundResponse {
  refundId: string;
  transactionId: string;
  organizationId: string;
  amount: string;
  reason: string | null;
  status: EnumValue<number>;
  entryGroupId: string | null;
  createdAt: string;
  executedAt: string | null;
}

export function mapRefundResponse(raw: unknown): RefundResponse {
  return {
    refundId: stringFieldOrNull(raw, 'refundId')!,
    transactionId: stringFieldOrNull(raw, 'transactionId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    amount: stringFieldOrNull(raw, 'amount')!,
    reason: stringFieldOrNull(raw, 'reason'),
    status: RefundStatus.fromRaw(Number(field(raw, 'status'))),
    entryGroupId: stringFieldOrNull(raw, 'entryGroupId'),
    createdAt: stringField(raw, 'createdAt'),
    executedAt: stringFieldOrNull(raw, 'executedAt'),
  };
}

export interface TransactionSettlementSummaryResponse {
  transactionId: string;
  settledAmount: string;
  refundedAmount: string;
  remainingReservedAmount: string;
  retainedAmount: string;
}

export function mapTransactionSettlementSummaryResponse(raw: unknown): TransactionSettlementSummaryResponse {
  return {
    transactionId: stringFieldOrNull(raw, 'transactionId')!,
    settledAmount: stringFieldOrNull(raw, 'settledAmount')!,
    refundedAmount: stringFieldOrNull(raw, 'refundedAmount')!,
    remainingReservedAmount: stringFieldOrNull(raw, 'remainingReservedAmount')!,
    retainedAmount: stringFieldOrNull(raw, 'retainedAmount')!,
  };
}

export interface ExecuteSettlementResult {
  settlementId: string;
}

export function mapExecuteSettlementResult(raw: unknown): ExecuteSettlementResult {
  return { settlementId: stringFieldOrNull(raw, 'settlementId')! };
}

export interface ExecuteRefundResult {
  refundId: string;
}

export function mapExecuteRefundResult(raw: unknown): ExecuteRefundResult {
  return { refundId: stringFieldOrNull(raw, 'refundId')! };
}
