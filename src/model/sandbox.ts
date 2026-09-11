import { field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';

export interface SandboxObservedAddressResponse {
  sandboxObservedAddressId: string;
  address: string | null;
  assetNetworkId: string;
  lastObservedReference: string | null;
  lastConfirmationCount: number | null;
  createdAt: string;
}

export function mapSandboxObservedAddressResponse(raw: unknown): SandboxObservedAddressResponse {
  const lastConfirmationCount = field(raw, 'lastConfirmationCount');
  return {
    sandboxObservedAddressId: stringFieldOrNull(raw, 'sandboxObservedAddressId')!,
    address: stringFieldOrNull(raw, 'address'),
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    lastObservedReference: stringFieldOrNull(raw, 'lastObservedReference'),
    lastConfirmationCount: lastConfirmationCount === null || lastConfirmationCount === undefined ? null : Number(lastConfirmationCount),
    createdAt: stringField(raw, 'createdAt'),
  };
}

export interface SandboxBroadcastAttemptResponse {
  sandboxBroadcastAttemptId: string;
  destinationAddress: string | null;
  amount: string;
  assetNetworkId: string;
  status: string | null;
  technicalReference: string | null;
  createdAt: string;
}

export function mapSandboxBroadcastAttemptResponse(raw: unknown): SandboxBroadcastAttemptResponse {
  return {
    sandboxBroadcastAttemptId: stringFieldOrNull(raw, 'sandboxBroadcastAttemptId')!,
    destinationAddress: stringFieldOrNull(raw, 'destinationAddress'),
    amount: stringFieldOrNull(raw, 'amount')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    status: stringFieldOrNull(raw, 'status'),
    technicalReference: stringFieldOrNull(raw, 'technicalReference'),
    createdAt: stringField(raw, 'createdAt'),
  };
}

export interface SandboxTreasuryObservedBalanceResponse {
  assetNetworkId: string;
  balance: string;
  updatedAt: string;
}

export function mapSandboxTreasuryObservedBalanceResponse(raw: unknown): SandboxTreasuryObservedBalanceResponse {
  return {
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    balance: stringFieldOrNull(raw, 'balance')!,
    updatedAt: stringField(raw, 'updatedAt'),
  };
}

export interface SandboxWalletBalanceResponse {
  environmentId: string;
  assetNetworkId: string;
  address: string;
  balance: string;
  updatedAt: string;
}

export function mapSandboxWalletBalanceResponse(raw: unknown): SandboxWalletBalanceResponse {
  return {
    environmentId: stringFieldOrNull(raw, 'environmentId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    address: stringFieldOrNull(raw, 'address')!,
    balance: stringFieldOrNull(raw, 'balance')!,
    updatedAt: stringField(raw, 'updatedAt'),
  };
}

export interface SandboxWalletTransferResponse {
  fromAddress: string;
  fromBalanceAfter: string;
  toAddress: string;
  toBalanceAfter: string;
  occurredAt: string;
}

export function mapSandboxWalletTransferResponse(raw: unknown): SandboxWalletTransferResponse {
  return {
    fromAddress: stringFieldOrNull(raw, 'fromAddress')!,
    fromBalanceAfter: stringFieldOrNull(raw, 'fromBalanceAfter')!,
    toAddress: stringFieldOrNull(raw, 'toAddress')!,
    toBalanceAfter: stringFieldOrNull(raw, 'toBalanceAfter')!,
    occurredAt: stringField(raw, 'occurredAt'),
  };
}

export interface SandboxObservedAddressResult { sandboxObservedAddressId: string }
export function mapSandboxObservedAddressResult(raw: unknown): SandboxObservedAddressResult {
  return { sandboxObservedAddressId: stringFieldOrNull(raw, 'sandboxObservedAddressId')! };
}

export interface SandboxBroadcastAttemptResult { sandboxBroadcastAttemptId: string }
export function mapSandboxBroadcastAttemptResult(raw: unknown): SandboxBroadcastAttemptResult {
  return { sandboxBroadcastAttemptId: stringFieldOrNull(raw, 'sandboxBroadcastAttemptId')! };
}
