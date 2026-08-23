import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { DerivationScheme } from './enums.js';

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
