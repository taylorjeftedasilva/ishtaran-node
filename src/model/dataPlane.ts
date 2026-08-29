import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { WithdrawalStatus, EntryNature, TransactionStatus } from './enums.js';

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

export interface WithdrawalQuoteResponse {
  accountId: string;
  withdrawalDestinationId: string;
  assetNetworkId: string;
  /** Exact string -- never a `number`, never rounded (see SDK_CAPABILITY_SPEC.md §11.1). */
  requestedAmount: string;
  estimatedNetworkFee: string;
  estimatedRecipientAmount: string;
  expiresAt: string;
}

export function mapWithdrawalQuoteResponse(raw: unknown): WithdrawalQuoteResponse {
  return {
    accountId: stringFieldOrNull(raw, 'accountId')!,
    withdrawalDestinationId: stringFieldOrNull(raw, 'withdrawalDestinationId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    requestedAmount: stringFieldOrNull(raw, 'requestedAmount')!,
    estimatedNetworkFee: stringFieldOrNull(raw, 'estimatedNetworkFee')!,
    estimatedRecipientAmount: stringFieldOrNull(raw, 'estimatedRecipientAmount')!,
    expiresAt: stringFieldOrNull(raw, 'expiresAt')!,
  };
}

export interface WithdrawalResponse {
  withdrawalId: string;
  organizationId: string;
  accountId: string;
  withdrawalDestinationId: string;
  assetNetworkId: string;
  amount: string;
  estimatedNetworkFee: string;
  estimatedRecipientAmount: string;
  finalNetworkFee: string | null;
  finalRecipientAmount: string | null;
  status: EnumValue<number>;
  entryGroupId: string | null;
  technicalReference: string | null;
  createdAt: string;
}

export function mapWithdrawalResponse(raw: unknown): WithdrawalResponse {
  return {
    withdrawalId: stringFieldOrNull(raw, 'withdrawalId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    accountId: stringFieldOrNull(raw, 'accountId')!,
    withdrawalDestinationId: stringFieldOrNull(raw, 'withdrawalDestinationId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    amount: stringFieldOrNull(raw, 'amount')!,
    estimatedNetworkFee: stringFieldOrNull(raw, 'estimatedNetworkFee')!,
    estimatedRecipientAmount: stringFieldOrNull(raw, 'estimatedRecipientAmount')!,
    finalNetworkFee: stringFieldOrNull(raw, 'finalNetworkFee'),
    finalRecipientAmount: stringFieldOrNull(raw, 'finalRecipientAmount'),
    status: WithdrawalStatus.fromRaw(Number(field(raw, 'status'))),
    entryGroupId: stringFieldOrNull(raw, 'entryGroupId'),
    technicalReference: stringFieldOrNull(raw, 'technicalReference'),
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
