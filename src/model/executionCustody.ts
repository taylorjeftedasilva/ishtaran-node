import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { DerivationScheme, NetworkCostPayer, NetworkResourceSource } from './enums.js';

export interface RegisterWalletResult {
  walletId: string;
}

export function mapRegisterWalletResult(raw: unknown): RegisterWalletResult {
  return { walletId: stringFieldOrNull(raw, 'walletId')! };
}

/** BR-WLT-002 -- never includes the derivation material (dedicated route, {@link WalletPublicMaterialResult}). */
export interface WalletResponse {
  walletId: string;
  applicationId: string;
  networkId: string;
  scheme: EnumValue<number>;
  nextDerivationIndex: number;
  registeredAt: string;
}

export function mapWalletResponse(raw: unknown): WalletResponse {
  return {
    walletId: stringFieldOrNull(raw, 'walletId')!,
    applicationId: stringFieldOrNull(raw, 'applicationId')!,
    networkId: stringFieldOrNull(raw, 'networkId')!,
    scheme: DerivationScheme.fromRaw(Number(field(raw, 'scheme'))),
    nextDerivationIndex: Number(field(raw, 'nextDerivationIndex')),
    registeredAt: stringField(raw, 'registeredAt'),
  };
}

/** BR-WLT-002 -- the only legitimate place derivation material is exposed (Confidential, never Secret). */
export interface WalletPublicMaterialResult {
  publicDerivationMaterial: string;
}

export function mapWalletPublicMaterialResult(raw: unknown): WalletPublicMaterialResult {
  return { publicDerivationMaterial: stringFieldOrNull(raw, 'publicDerivationMaterial')! };
}

/** BR-WLT-001 -- `derivationReference` is never reused across calls. */
export interface AllocatedDepositAddressResult {
  walletId: string;
  address: string;
  derivationReference: number;
}

export function mapAllocatedDepositAddressResult(raw: unknown): AllocatedDepositAddressResult {
  return {
    walletId: stringFieldOrNull(raw, 'walletId')!,
    address: stringFieldOrNull(raw, 'address')!,
    derivationReference: Number(field(raw, 'derivationReference')),
  };
}

/** A leg already calculated by the caller (Settlement/Withdrawal, DEC-025) -- never recomputed by the SDK. */
export interface ExecutionLegInput {
  role: string;
  destinationAddress: string;
  amount: string;
}

export interface CreateSigningRequestResult {
  signingRequestId: string;
}

export function mapCreateSigningRequestResult(raw: unknown): CreateSigningRequestResult {
  return { signingRequestId: stringFieldOrNull(raw, 'signingRequestId')! };
}

/**
 * `status`/`mismatchReason`/`broadcastReference` are raw strings in the real JSON (Group A) --
 * the possible values (`PendingSignature`/`Verified`/`MismatchDetected`/`Broadcast`/...) don't
 * yet have a closed catalog documented outside the backend source code.
 */
export interface ExecutionLegResponse {
  executionLegId: string;
  role: string;
  destinationAddress: string;
  amount: string;
  canonicalHash: string;
  status: string;
  mismatchReason: string | null;
  broadcastReference: string | null;
}

export function mapExecutionLegResponse(raw: unknown): ExecutionLegResponse {
  return {
    executionLegId: stringFieldOrNull(raw, 'executionLegId')!,
    role: stringField(raw, 'role'),
    destinationAddress: stringField(raw, 'destinationAddress'),
    amount: stringFieldOrNull(raw, 'amount')!,
    canonicalHash: stringField(raw, 'canonicalHash'),
    status: stringField(raw, 'status'),
    mismatchReason: stringFieldOrNull(raw, 'mismatchReason'),
    broadcastReference: stringFieldOrNull(raw, 'broadcastReference'),
  };
}

export interface SigningRequestResponse {
  signingRequestId: string;
  applicationId: string;
  environmentId: string;
  networkId: string;
  walletId: string;
  derivationReference: number;
  originReference: string;
  assetNetworkId: string;
  sourceAddress: string;
  protocolVersion: number;
  legs: ExecutionLegResponse[];
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export function mapSigningRequestResponse(raw: unknown): SigningRequestResponse {
  return {
    signingRequestId: stringFieldOrNull(raw, 'signingRequestId')!,
    applicationId: stringFieldOrNull(raw, 'applicationId')!,
    environmentId: stringFieldOrNull(raw, 'environmentId')!,
    networkId: stringFieldOrNull(raw, 'networkId')!,
    walletId: stringFieldOrNull(raw, 'walletId')!,
    derivationReference: Number(field(raw, 'derivationReference')),
    originReference: stringField(raw, 'originReference'),
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    sourceAddress: stringField(raw, 'sourceAddress'),
    protocolVersion: Number(field(raw, 'protocolVersion')),
    legs: arrayField(raw, 'legs', mapExecutionLegResponse),
    createdAt: stringField(raw, 'createdAt'),
    expiresAt: stringField(raw, 'expiresAt'),
    isExpired: Boolean(field(raw, 'isExpired')),
  };
}

/**
 * `verified=false` corresponds to the public code `SIGNED_TRANSACTION_MISMATCH` (backend
 * SPEC-020 §Errors) -- never broadcast (INV-SC-03). `allLegsVerified=true` means the broadcast of
 * ALL Legs has already fired within the same Command (all-signatures gate).
 */
export interface SubmitSignedTransactionResult {
  executionLegId: string;
  verified: boolean;
  mismatchReason: string | null;
  allLegsVerified: boolean;
}

export function mapSubmitSignedTransactionResult(raw: unknown): SubmitSignedTransactionResult {
  return {
    executionLegId: stringFieldOrNull(raw, 'executionLegId')!,
    verified: Boolean(field(raw, 'verified')),
    mismatchReason: stringFieldOrNull(raw, 'mismatchReason'),
    allLegsVerified: Boolean(field(raw, 'allLegsVerified')),
  };
}

/**
 * DEC-037 -- a beneficiary's valid on-chain receiving address for a given AssetNetwork, consumed
 * by SelfCustodySettlementExecutionStrategy when building an ExecutionLeg. Deliberately NOT
 * `WithdrawalDestination` -- no whitelist/cooldown policy, first-registration-wins (a second
 * registration for the same accountId+assetNetworkId is rejected, never silently overwritten).
 */
export interface RegisterExecutionDestinationResult {
  executionDestinationId: string;
}

export function mapRegisterExecutionDestinationResult(raw: unknown): RegisterExecutionDestinationResult {
  return { executionDestinationId: stringFieldOrNull(raw, 'executionDestinationId')! };
}

/**
 * SPEC-ADDRESSPOOL-001/CUSTODY-EXECUTION-MODES.md -- the outbound-only counterpart of a Wallet
 * derivation: the address ExecutionCustody signs FROM to pay network cost (Energy/Bandwidth/gas),
 * never confused with an ExecutionDestination (a beneficiary's inbound address). Must be
 * registered before the first self-custody Withdrawal/Payout on a given AssetNetwork -- see
 * `docs/specs/execution-custody/README.md` "Bootstrap obrigatório" for the required order
 * (Wallet -> ExecutionSource -> NetworkCostPayerAccount).
 */
export interface RegisterExecutionSourceResult {
  executionSourceId: string;
}

export function mapRegisterExecutionSourceResult(raw: unknown): RegisterExecutionSourceResult {
  return { executionSourceId: stringFieldOrNull(raw, 'executionSourceId')! };
}

/**
 * SPEC-NETEXEC-001 -- the Account debited for the *charged* network cost (`totalCharged`, in
 * `quoteCurrency`) once a NetworkExecutionQuote is authorized. First-registration-wins per
 * (organizationId, assetNetworkId), same as ExecutionDestination -- never silently overwritten.
 * Must belong to the same Organization as the caller (a cross-tenant AccountId is rejected).
 */
export interface RegisterNetworkCostPayerAccountResult {
  networkCostPayerAccountId: string;
}

export function mapRegisterNetworkCostPayerAccountResult(raw: unknown): RegisterNetworkCostPayerAccountResult {
  return { networkCostPayerAccountId: stringFieldOrNull(raw, 'networkCostPayerAccountId')! };
}

/** A single physical operation to be priced -- input to {@link NetworkExecutionResource.quote}, never interpreted by the caller. */
export interface NetworkExecutionOperationInput {
  destinationAddress: string | null;
  /** Exact decimal string -- never a `number`, never rounded (see SDK_CAPABILITY_SPEC.md §11.1). */
  amount: string;
  kind: EnumValue<number>;
  reference: string | null;
}

/** SPEC-NETEXEC-001 Descoberta 2 -- the physical unit (what will be one real on-chain transaction), grouping 1..N transfers. */
export interface NetworkExecutionTransferResponse {
  destinationAddress: string;
  amount: string;
  sourceOperationReference: string | null;
}

function mapNetworkExecutionTransferResponse(raw: unknown): NetworkExecutionTransferResponse {
  return {
    destinationAddress: stringField(raw, 'destinationAddress'),
    amount: stringFieldOrNull(raw, 'amount')!,
    sourceOperationReference: stringFieldOrNull(raw, 'sourceOperationReference'),
  };
}

export interface NetworkExecutionTransactionResponse {
  transfers: NetworkExecutionTransferResponse[];
}

function mapNetworkExecutionTransactionResponse(raw: unknown): NetworkExecutionTransactionResponse {
  return { transfers: arrayField(raw, 'transfers', mapNetworkExecutionTransferResponse) };
}

/** SPEC-NETEXEC-001 BL-NET-002 -- structured result of `INetworkExecutionPlanner.Plan(...)`, never flattened into loose fields. */
export interface NetworkExecutionPlanResponse {
  assetNetworkId: string;
  transactions: NetworkExecutionTransactionResponse[];
}

function mapNetworkExecutionPlanResponse(raw: unknown): NetworkExecutionPlanResponse {
  return {
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    transactions: arrayField(raw, 'transactions', mapNetworkExecutionTransactionResponse),
  };
}

/** SPEC-NETEXEC-001 Descoberta 6/BR-NET-008 -- `resourceCode` is opaque (string), never interpreted by the generic caller. */
export interface NetworkResourceLineResponse {
  resourceCode: string;
  quantity: string;
  unit: string | null;
}

function mapNetworkResourceLineResponse(raw: unknown): NetworkResourceLineResponse {
  return {
    resourceCode: stringField(raw, 'resourceCode'),
    quantity: stringFieldOrNull(raw, 'quantity')!,
    unit: stringFieldOrNull(raw, 'unit'),
  };
}

export interface NetworkResourceEstimateResponse {
  lines: NetworkResourceLineResponse[];
}

function mapNetworkResourceEstimateResponse(raw: unknown): NetworkResourceEstimateResponse {
  return { lines: arrayField(raw, 'lines', mapNetworkResourceLineResponse) };
}

/**
 * SPEC-NETEXEC-001 (brief §13) -- mirror of `ExecutionCustody.Domain.ValueObjects.NetworkExecutionQuote`.
 * `nativeExecutionCost`/`authorizedNativeCost` are always in the RESOURCE asset's native units
 * (`resourceAssetNetworkId ?? assetNetworkId`); `totalCharged` is always in `quoteCurrency` (the
 * CHARGED asset) -- `totalCharged = (nativeExecutionCost * fx) + safetyBuffer +
 * replenishmentRequirement + conversionOverhead`. `authorizedNativeCost` is the number actually
 * reserved for execution (>= the sum of every physical operation's cost, INC-18) -- never compare
 * a caller-supplied estimate directly against `nativeExecutionCost` alone.
 */
export interface NetworkExecutionQuoteResponse {
  network: string | null;
  plan: NetworkExecutionPlanResponse;
  estimatedResources: NetworkResourceEstimateResponse;
  nativeExecutionCost: string;
  resourceAssetNetworkId: string | null;
  quoteCurrency: string | null;
  fx: string;
  safetyBuffer: string;
  resourceSource: EnumValue<number>;
  replenishmentRequirement: string | null;
  conversionOverhead: string;
  expiresAt: string;
  totalCharged: string;
  networkCostPayer: EnumValue<number>;
  authorizedNativeCost: string;
}

export function mapNetworkExecutionQuoteResponse(raw: unknown): NetworkExecutionQuoteResponse {
  return {
    network: stringFieldOrNull(raw, 'network'),
    plan: mapNetworkExecutionPlanResponse(field(raw, 'plan')),
    estimatedResources: mapNetworkResourceEstimateResponse(field(raw, 'estimatedResources')),
    nativeExecutionCost: stringFieldOrNull(raw, 'nativeExecutionCost')!,
    resourceAssetNetworkId: stringFieldOrNull(raw, 'resourceAssetNetworkId'),
    quoteCurrency: stringFieldOrNull(raw, 'quoteCurrency'),
    fx: stringFieldOrNull(raw, 'fx')!,
    safetyBuffer: stringFieldOrNull(raw, 'safetyBuffer')!,
    resourceSource: NetworkResourceSource.fromRaw(Number(field(raw, 'resourceSource'))),
    replenishmentRequirement: stringFieldOrNull(raw, 'replenishmentRequirement'),
    conversionOverhead: stringFieldOrNull(raw, 'conversionOverhead')!,
    expiresAt: stringField(raw, 'expiresAt'),
    totalCharged: stringFieldOrNull(raw, 'totalCharged')!,
    networkCostPayer: NetworkCostPayer.fromRaw(Number(field(raw, 'networkCostPayer'))),
    authorizedNativeCost: stringFieldOrNull(raw, 'authorizedNativeCost')!,
  };
}
