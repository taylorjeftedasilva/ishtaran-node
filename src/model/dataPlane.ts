import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { WithdrawalStatus, EntryNature, TransactionStatus, NetworkExecutionCostStatus } from './enums.js';

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

export interface BalanceResponse {
  available: string;
  pending: string;
  reserved: string;
}

export function mapBalanceResponse(raw: unknown): BalanceResponse {
  return {
    available: stringFieldOrNull(raw, 'available')!,
    pending: stringFieldOrNull(raw, 'pending')!,
    reserved: stringFieldOrNull(raw, 'reserved')!,
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
