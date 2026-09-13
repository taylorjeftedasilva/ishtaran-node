import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { WithdrawalStatus, EntryNature, TransactionStatus, NetworkExecutionCostStatus, ExecutionStatus, TransferStatus } from './enums.js';

/**
 * DEC-032 -- an `Account` no longer belongs to a single Organization directly (global identity,
 * linked to N Organizations via `Relationship`). For the Organization-scoped link, see
 * {@link OrganizationAccountResponse} (`accountHolders.ts`), returned by `accounts.list()`.
 */
export interface AccountResponse {
  accountId: string;
  accountHolderId: string;
  status: string | null;
  createdAt: string;
}

export function mapAccountResponse(raw: unknown): AccountResponse {
  return {
    accountId: stringFieldOrNull(raw, 'accountId')!,
    accountHolderId: stringFieldOrNull(raw, 'accountHolderId')!,
    status: stringFieldOrNull(raw, 'status'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
  };
}

export interface CreateAccountResult {
  accountId: string;
}

export function mapCreateAccountResult(raw: unknown): CreateAccountResult {
  return { accountId: stringFieldOrNull(raw, 'accountId')! };
}

/**
 * SPEC-026 Descoberta 7/8 -- `estimatedNetworkFee` is `[Obsolete]` and always `null` under
 * SelfCustody (the only reachable path today, DEC-041): the beneficiary always receives the full
 * `requestedAmount`, never `amount - fee`. `networkExecutionCost` is the new source of truth for
 * network cost (SPEC-NETEXEC-001). `preview quote != execution quote` -- `request()` always
 * re-quotes from zero via `EnsureViableAsync`, never reuses this response as a price guarantee.
 */
export interface WithdrawalQuoteResponse {
  accountId: string;
  withdrawalDestinationId: string;
  assetNetworkId: string;
  /** Exact string -- never a `number`, never rounded (see SDK_CAPABILITY_SPEC.md §11.1). */
  requestedAmount: string;
  /** @deprecated Vestigial under SelfCustody, always `null`. Use {@link networkExecutionCost}. */
  estimatedNetworkFee: string | null;
  estimatedRecipientAmount: string;
  networkExecutionCost: string;
  expiresAt: string;
}

export function mapWithdrawalQuoteResponse(raw: unknown): WithdrawalQuoteResponse {
  return {
    accountId: stringFieldOrNull(raw, 'accountId')!,
    withdrawalDestinationId: stringFieldOrNull(raw, 'withdrawalDestinationId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    requestedAmount: stringFieldOrNull(raw, 'requestedAmount')!,
    estimatedNetworkFee: stringFieldOrNull(raw, 'estimatedNetworkFee'),
    estimatedRecipientAmount: stringFieldOrNull(raw, 'estimatedRecipientAmount')!,
    networkExecutionCost: stringFieldOrNull(raw, 'networkExecutionCost')!,
    expiresAt: stringFieldOrNull(raw, 'expiresAt')!,
  };
}

/**
 * SPEC-026 Descoberta 8 -- same `estimatedNetworkFee`/`finalNetworkFee` deprecation as
 * {@link WithdrawalQuoteResponse}. `signingRequestId` is populated only under SelfCustody, once
 * there's something to sign (same role as `SettlementResponse.signingRequestId`).
 * `networkExecutionCost`/`networkExecutionCostStatus` are the new source of truth for network
 * cost, via `NetworkExecutionCostSettlementService` (SPEC-NETEXEC-002); both `null` before a
 * network cost has been reserved yet.
 */
export interface WithdrawalResponse {
  withdrawalId: string;
  organizationId: string;
  environmentId: string;
  accountId: string;
  withdrawalDestinationId: string;
  assetNetworkId: string;
  amount: string;
  /** @deprecated Vestigial under SelfCustody, always `null`. Use {@link networkExecutionCost}. */
  estimatedNetworkFee: string | null;
  estimatedRecipientAmount: string;
  /** @deprecated Vestigial under SelfCustody, always `null`. Use {@link networkExecutionCost}. */
  finalNetworkFee: string | null;
  finalRecipientAmount: string | null;
  status: EnumValue<number>;
  entryGroupId: string | null;
  technicalReference: string | null;
  signingRequestId: string | null;
  networkExecutionCost: string | null;
  networkExecutionCostStatus: EnumValue<number> | null;
  createdAt: string;
}

export function mapWithdrawalResponse(raw: unknown): WithdrawalResponse {
  const networkExecutionCostStatusRaw = field(raw, 'networkExecutionCostStatus');
  return {
    withdrawalId: stringFieldOrNull(raw, 'withdrawalId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    environmentId: stringFieldOrNull(raw, 'environmentId')!,
    accountId: stringFieldOrNull(raw, 'accountId')!,
    withdrawalDestinationId: stringFieldOrNull(raw, 'withdrawalDestinationId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    amount: stringFieldOrNull(raw, 'amount')!,
    estimatedNetworkFee: stringFieldOrNull(raw, 'estimatedNetworkFee'),
    estimatedRecipientAmount: stringFieldOrNull(raw, 'estimatedRecipientAmount')!,
    finalNetworkFee: stringFieldOrNull(raw, 'finalNetworkFee'),
    finalRecipientAmount: stringFieldOrNull(raw, 'finalRecipientAmount'),
    status: WithdrawalStatus.fromRaw(Number(field(raw, 'status'))),
    entryGroupId: stringFieldOrNull(raw, 'entryGroupId'),
    technicalReference: stringFieldOrNull(raw, 'technicalReference'),
    signingRequestId: stringFieldOrNull(raw, 'signingRequestId'),
    networkExecutionCost: stringFieldOrNull(raw, 'networkExecutionCost'),
    networkExecutionCostStatus: networkExecutionCostStatusRaw === null || networkExecutionCostStatusRaw === undefined
      ? null
      : NetworkExecutionCostStatus.fromRaw(Number(networkExecutionCostStatusRaw)),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
  };
}

export interface CreateWithdrawalDestinationResult {
  withdrawalDestinationId: string;
}

export function mapCreateWithdrawalDestinationResult(raw: unknown): CreateWithdrawalDestinationResult {
  return { withdrawalDestinationId: stringFieldOrNull(raw, 'withdrawalDestinationId')! };
}

/**
 * G.2 (found 2026-09-11): the real backend record (Ledger.Contracts.Responses.BalanceResponse)
 * has carried `Payable`/`ReservedForPayout`/`Delivered` since SPEC-024/025 (2026-08-30) -- this
 * SDK silently dropped all three, parsing only the original 3 fields. Payable is what Payout owes
 * a beneficiary but hasn't paid yet (an economic obligation, never an on-chain balance);
 * ReservedForPayout is Payable already claimed by an in-flight PayoutBatch; Delivered is the
 * cumulative real payout total -- under SelfCustody this can grow while `available` stays exactly
 * 0, because the money already left the platform's custody entirely (see `client.walletBalance`
 * for the wallet's own on-chain state, a different question again).
 */
export interface BalanceResponse {
  available: string;
  pending: string;
  reserved: string;
  payable: string;
  reservedForPayout: string;
  delivered: string;
}

export function mapBalanceResponse(raw: unknown): BalanceResponse {
  return {
    available: stringFieldOrNull(raw, 'available')!,
    pending: stringFieldOrNull(raw, 'pending')!,
    reserved: stringFieldOrNull(raw, 'reserved')!,
    payable: stringFieldOrNull(raw, 'payable') ?? '0',
    reservedForPayout: stringFieldOrNull(raw, 'reservedForPayout') ?? '0',
    delivered: stringFieldOrNull(raw, 'delivered') ?? '0',
  };
}

export interface LedgerEntryResponse {
  entryId: string;
  ledgerAccountId: string;
  entryGroupId: string;
  nature: EnumValue<number>;
  amount: string;
  originReference: string;
  reversalOfEntryGroupId: string | null;
  createdAt: string;
}

export function mapLedgerEntryResponse(raw: unknown): LedgerEntryResponse {
  return {
    entryId: stringFieldOrNull(raw, 'entryId')!,
    ledgerAccountId: stringFieldOrNull(raw, 'ledgerAccountId')!,
    entryGroupId: stringFieldOrNull(raw, 'entryGroupId')!,
    nature: EntryNature.fromRaw(Number(field(raw, 'nature'))),
    amount: stringFieldOrNull(raw, 'amount')!,
    originReference: stringField(raw, 'originReference'),
    reversalOfEntryGroupId: stringFieldOrNull(raw, 'reversalOfEntryGroupId'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
  };
}

export interface ParticipantInput {
  accountId: string;
  role: string;
  isPayer: boolean;
  splitPercentage?: string;
}

export interface TransactionResponse {
  transactionId: string;
  organizationId: string;
  applicationId: string;
  /** DEC-037 -- explicit since creation, never inferred (an Application can have multiple Environments). */
  environmentId: string;
  workflowVersionId: string | null;
  currentWorkflowStateId: string | null;
  assetNetworkId: string;
  amount: string;
  status: EnumValue<number>;
  payerAccountId: string;
  participants: unknown[] | null;
  createdAt: string;
  settledAmount: string;
  refundedAmount: string;
}

export function mapTransactionResponse(raw: unknown): TransactionResponse {
  return {
    transactionId: stringFieldOrNull(raw, 'transactionId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    applicationId: stringFieldOrNull(raw, 'applicationId')!,
    environmentId: stringFieldOrNull(raw, 'environmentId')!,
    workflowVersionId: stringFieldOrNull(raw, 'workflowVersionId'),
    currentWorkflowStateId: stringFieldOrNull(raw, 'currentWorkflowStateId'),
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    amount: stringFieldOrNull(raw, 'amount')!,
    status: TransactionStatus.fromRaw(Number(field(raw, 'status'))),
    payerAccountId: stringFieldOrNull(raw, 'payerAccountId')!,
    participants: arrayField(raw, 'participants', (x) => x),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
    settledAmount: stringFieldOrNull(raw, 'settledAmount')!,
    refundedAmount: stringFieldOrNull(raw, 'refundedAmount')!,
  };
}

export interface CreateTransactionResult {
  transactionId: string;
}

export function mapCreateTransactionResult(raw: unknown): CreateTransactionResult {
  return { transactionId: stringFieldOrNull(raw, 'transactionId')! };
}

/**
 * PROMPT 5 §9 (G.7) -- `GET /v1/organizations/{organizationId}/executions`, discoverability for
 * `AwaitingSignature`/`Overdue` Executions (the safety rule that makes an Organization
 * settlement-restricted stays -- this only closes the operational hole of finding which Execution
 * caused it). The only real remediation for an `AwaitingSignature`/`Overdue` Execution is
 * `transactions.executeSettlement(executionId)` (non-custodial model -- there is no cancel path).
 */
export interface ExecutionResponse {
  executionId: string;
  transactionId: string;
  organizationId: string;
  status: EnumValue<number>;
  preparedAt: string;
  gracePeriodExpiresAt: string;
  executedAt: string | null;
  settlementId: string | null;
}

export function mapExecutionResponse(raw: unknown): ExecutionResponse {
  return {
    executionId: stringFieldOrNull(raw, 'executionId')!,
    transactionId: stringFieldOrNull(raw, 'transactionId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    status: ExecutionStatus.fromRaw(Number(field(raw, 'status'))),
    preparedAt: stringFieldOrNull(raw, 'preparedAt')!,
    gracePeriodExpiresAt: stringFieldOrNull(raw, 'gracePeriodExpiresAt')!,
    executedAt: stringFieldOrNull(raw, 'executedAt'),
    settlementId: stringFieldOrNull(raw, 'settlementId'),
  };
}

export interface TransactionStatusResponse {
  status: EnumValue<number>;
  workflowVersionId: string | null;
  currentWorkflowStateId: string | null;
}

export function mapTransactionStatusResponse(raw: unknown): TransactionStatusResponse {
  return {
    status: TransactionStatus.fromRaw(Number(field(raw, 'status'))),
    workflowVersionId: stringFieldOrNull(raw, 'workflowVersionId'),
    currentWorkflowStateId: stringFieldOrNull(raw, 'currentWorkflowStateId'),
  };
}

/**
 * PROMPT 7 (SPEC-TRANSFER-001) -- first-class Transfer, never a Payment/Settlement in disguise.
 * `amount` is always exactly what the recipient receives (BR-TRF-004, ON_TOP fee mode) --
 * `platformFeeAmount` is charged separately, on top, from the sender.
 */
export interface TransferResponse {
  transferId: string;
  organizationId: string;
  applicationId: string;
  environmentId: string;
  sourceAccountId: string;
  assetNetworkId: string;
  amount: string;
  destinationAddress: string;
  destinationAccountId: string | null;
  platformFeeAmount: string;
  platformFeePercentage: string;
  status: EnumValue<number>;
  /** BR-TRF-008 -- the real SigningRequest (ExecutionCustody). Use it with `signingRequests.get(...)` to fetch the Legs/canonicalHash to sign locally, then `signingRequests.submitSignedTransaction(...)` per Leg. Null only if the Transfer failed before a SigningRequest could be created. */
  signingRequestId: string | null;
  createdAt: string;
  confirmedAt: string | null;
  failureReason: string | null;
}

export function mapTransferResponse(raw: unknown): TransferResponse {
  return {
    transferId: stringFieldOrNull(raw, 'transferId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    applicationId: stringFieldOrNull(raw, 'applicationId')!,
    environmentId: stringFieldOrNull(raw, 'environmentId')!,
    sourceAccountId: stringFieldOrNull(raw, 'sourceAccountId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    amount: stringFieldOrNull(raw, 'amount')!,
    destinationAddress: stringFieldOrNull(raw, 'destinationAddress')!,
    destinationAccountId: stringFieldOrNull(raw, 'destinationAccountId'),
    platformFeeAmount: stringFieldOrNull(raw, 'platformFeeAmount')!,
    platformFeePercentage: stringFieldOrNull(raw, 'platformFeePercentage')!,
    status: TransferStatus.fromRaw(Number(field(raw, 'status'))),
    signingRequestId: stringFieldOrNull(raw, 'signingRequestId'),
    createdAt: stringFieldOrNull(raw, 'createdAt')!,
    confirmedAt: stringFieldOrNull(raw, 'confirmedAt'),
    failureReason: stringFieldOrNull(raw, 'failureReason'),
  };
}
