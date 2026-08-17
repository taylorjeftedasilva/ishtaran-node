import { arrayField, field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { DepositStatus, PaymentIntentStatus } from './enums.js';

export interface DepositResponse {
  depositId: string;
  paymentIntentId: string;
  technicalReference: string | null;
  amount: string;
  status: EnumValue<number>;
  confirmationCount: number;
  wasConfirmedBeforeReorg: boolean;
  isLate: boolean;
  createdAt: string;
}

export function mapDepositResponse(raw: unknown): DepositResponse {
  return {
    depositId: stringFieldOrNull(raw, 'depositId')!,
    paymentIntentId: stringFieldOrNull(raw, 'paymentIntentId')!,
    technicalReference: stringFieldOrNull(raw, 'technicalReference'),
    amount: stringFieldOrNull(raw, 'amount')!,
    status: DepositStatus.fromRaw(Number(field(raw, 'status'))),
    confirmationCount: Number(field(raw, 'confirmationCount')),
    wasConfirmedBeforeReorg: Boolean(field(raw, 'wasConfirmedBeforeReorg')),
    isLate: Boolean(field(raw, 'isLate')),
    createdAt: stringField(raw, 'createdAt'),
  };
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  organizationId: string;
  transactionId: string;
  assetNetworkId: string;
  amount: string;
  status: EnumValue<number>;
  expiresAt: string | null;
  depositAddress: string | null;
  deposits: DepositResponse[];
  createdAt: string;
}

export function mapPaymentIntentResponse(raw: unknown): PaymentIntentResponse {
  return {
    paymentIntentId: stringFieldOrNull(raw, 'paymentIntentId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    transactionId: stringFieldOrNull(raw, 'transactionId')!,
    assetNetworkId: stringFieldOrNull(raw, 'assetNetworkId')!,
    amount: stringFieldOrNull(raw, 'amount')!,
    status: PaymentIntentStatus.fromRaw(Number(field(raw, 'status'))),
    expiresAt: stringFieldOrNull(raw, 'expiresAt'),
    depositAddress: stringFieldOrNull(raw, 'depositAddress'),
    deposits: arrayField(raw, 'deposits', mapDepositResponse),
    createdAt: stringField(raw, 'createdAt'),
  };
}

export interface CreatePaymentIntentResult {
  paymentIntentId: string;
}

export function mapCreatePaymentIntentResult(raw: unknown): CreatePaymentIntentResult {
  return { paymentIntentId: stringFieldOrNull(raw, 'paymentIntentId')! };
}
