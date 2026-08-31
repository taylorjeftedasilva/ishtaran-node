import { createEnum } from './enumFactory.js';

/**
 * See SDK_CAPABILITY_SPEC.md §11.3 for the full name<->value table extracted literally from the
 * real C# enums. Group B = raw integer in JSON; Group A = readable string.
 */

// ---- Group B (integer) ----
export const DepositStatus = createEnum<number>({
  DETECTED: 0, CONFIRMING: 1, CONFIRMED: 2, UNDER_REVIEW: 3, REORG_DETECTED: 4, REJECTED: 5,
});
export const PaymentIntentStatus = createEnum<number>({
  PENDING: 0, PARTIALLY_PAID: 1, PAID: 2, EXPIRED: 3, CANCELLED: 4,
});
export const TransactionStatus = createEnum<number>({
  CREATED: 0, AWAITING_FUNDS: 1, FUNDED: 2, RESERVED: 3, SETTLED: 4,
  PARTIALLY_REFUNDED: 5, REFUNDED: 6, FROZEN: 7, CANCELLED: 8, PARTIALLY_SETTLED: 9,
});
export const WithdrawalStatus = createEnum<number>({
  REQUESTED: 0, VALIDATING: 1, PENDING_APPROVAL: 2, APPROVED: 3, REJECTED: 4,
  BROADCASTING: 5, BROADCAST_FAILED: 6, CONFIRMING: 7, COMPLETED: 8, CANCELLED: 9,
});
export const SettlementStatus = createEnum<number>({ PENDING: 0, EXECUTING: 1, COMPLETED: 2, FAILED: 3 });
export const RefundStatus = createEnum<number>({ REQUESTED: 0, APPROVED: 1, EXECUTED: 2, REJECTED: 3 });
export const SplitAllocationStatus = createEnum<number>({ EXECUTED: 0, RETAINED: 1, RELEASED: 2 });
export const SplitRetentionReason = createEnum<number>({
  ACCOUNT_NOT_FOUND: 0, ACCOUNT_NOT_ACTIVE: 1, ACCOUNT_NOT_AUTHORIZED_FOR_APPLICATION: 2,
});
export const WebhookEndpointStatus = createEnum<number>({ ACTIVE: 0, INACTIVE: 1 });
export const WebhookDeliveryStatus = createEnum<number>({
  PENDING: 0, DELIVERING: 1, DELIVERED: 2, RETRYING: 3, DEAD_LETTER: 4, CANCELLED: 5,
});
export const EntryNature = createEnum<number>({ AVAILABLE: 0, PENDING: 1, RESERVED: 2 });
export const ConditionOperator = createEnum<number>({ EQUALS: 1, GREATER_THAN_OR_EQUAL: 2, LESS_THAN_OR_EQUAL: 3 });
export const EventSource = createEnum<number>({ APPLICATION: 1, PLATFORM_TIMER: 2, MANUAL_REVIEW: 3 });
export const SimulatedBroadcastOutcome = createEnum<number>({ ACCEPTED: 1, FAILED: 2 });
/** Only used in REQUEST (CreateEnvironmentRequest.type) -- there is no real EnvironmentResponse in the API. */
export const EnvironmentType = createEnum<number>({ SANDBOX: 1, PRODUCTION: 2 });
/** ExecutionCustody.Contracts.Enums.DerivationScheme (SPEC-021, checkpoint 8) -- wire-format only, Group B. */
export const DerivationScheme = createEnum<number>({ TRON_BIP44_HARDENED_ACCOUNT: 1 });
/** Only used in REQUEST (InviteMemberRequest.role/AssignRoleRequest.newRole) -- the response is Group A (string). */
export const MemberRoleRequest = createEnum<number>({ OWNER: 1, ADMIN: 2, FINANCE: 3, READ_ONLY: 4 });
/** Withdrawals.Contracts.Enums.NetworkExecutionCostStatus (SPEC-026 Descoberta 8) -- derived from Withdrawal.Status, never its own persisted state. */
export const NetworkExecutionCostStatus = createEnum<number>({ RESERVED: 0, SETTLED: 1, RELEASED: 2, REQUIRES_RECONCILIATION: 3 });
/** ExecutionCustody.Contracts.Enums.NetworkCostPayer (SPEC-NETEXEC-001) -- who is charged for the quoted network cost. */
export const NetworkCostPayer = createEnum<number>({ INTEGRATOR: 0, REQUESTER: 1 });
/** ExecutionCustody.Contracts.Enums.NetworkResourceSource (SPEC-TRON-RESOURCE-001) -- where the physical network resource (e.g. TRON Energy/Bandwidth) came from. */
export const NetworkResourceSource = createEnum<number>({
  NOT_EVALUATED: 0, SELF: 1, ISHTARAN_SPONSORED: 2, PEER: 3, EXTERNAL: 4,
});
/** ExecutionCustody.Contracts.Enums.NetworkOperationKind (SPEC-NETEXEC-001) -- the kind of physical on-chain operation a NetworkExecutionQuote is priced for. */
export const NetworkOperationKind = createEnum<number>({
  TRANSFER: 0, SWAP: 1, STAKE: 2, UNSTAKE: 3, DELEGATE: 4, UNDELEGATE: 5,
});
/** Payout.Contracts.Enums.PayoutBatchTrigger (SPEC-025) -- this SDK slice only ever sends MANUAL (CreatePayoutBatchCommand accepts no other trigger via the public route yet). */
export const PayoutBatchTrigger = createEnum<number>({ THRESHOLD_CROSSED: 0, SCHEDULED: 1, MANUAL: 2 });
/** Payout.Contracts.Enums.PayoutBatchStatus (SPEC-025). */
export const PayoutBatchStatus = createEnum<number>({
  CREATED: 0, RESERVED: 1, EXECUTING: 2, COMPLETED: 3, PARTIALLY_FAILED: 4, FAILED: 5,
});
/** Payout.Contracts.Enums.PayoutBatchObligationStatus (SPEC-025). */
export const PayoutBatchObligationStatus = createEnum<number>({
  INCLUDED: 0, CONFIRMED: 1, FAILED: 2, REQUIRES_RECONCILIATION: 3,
});

// ---- Group A (string) ----
export const AccountStatus = createEnum<string>({ ACTIVE: 'Active', FROZEN: 'Frozen', CLOSED: 'Closed' });
export const ApplicationStatus = createEnum<string>({ ACTIVE: 'Active', SUSPENDED: 'Suspended', ARCHIVED: 'Archived' });
export const OrganizationStatus = createEnum<string>({ ACTIVE: 'Active', SUSPENDED: 'Suspended', CLOSED: 'Closed' });
export const MemberStatus = createEnum<string>({ INVITED: 'Invited', ACTIVE: 'Active', SUSPENDED: 'Suspended', REMOVED: 'Removed' });
export const WorkflowStatus = createEnum<string>({ DRAFT: 'Draft', PUBLISHED: 'Published', DEPRECATED: 'Deprecated' });
export const CatalogEntryStatus = createEnum<string>({ ENABLED: 'Enabled', DISABLED: 'Disabled' });
export const AssetNetworkStatus = createEnum<string>({ ENABLED: 'Enabled', PAUSED: 'Paused', DISABLED: 'Disabled' });
export const AssetKind = createEnum<string>({ FIAT: 'Fiat', CRYPTO: 'Crypto' });
