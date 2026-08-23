import { field, stringField, stringFieldOrNull } from '../resources/resourceSupport.js';
import { EnumValue } from './enumFactory.js';
import { WebhookDeliveryStatus, WebhookEndpointStatus } from './enums.js';

export interface WebhookEndpointResponse {
  webhookEndpointId: string;
  organizationId: string;
  url: string | null;
  status: EnumValue<number>;
  createdAt: string;
}

export function mapWebhookEndpointResponse(raw: unknown): WebhookEndpointResponse {
  return {
    webhookEndpointId: stringFieldOrNull(raw, 'webhookEndpointId')!,
    organizationId: stringFieldOrNull(raw, 'organizationId')!,
    url: stringFieldOrNull(raw, 'url'),
    status: WebhookEndpointStatus.fromRaw(Number(field(raw, 'status'))),
    createdAt: stringField(raw, 'createdAt'),
  };
}

export interface WebhookDeliveryResponse {
  webhookDeliveryId: string;
  webhookEndpointId: string;
  eventType: string | null;
  sequenceNumber: string;
  status: EnumValue<number>;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  lastAttemptAt: string | null;
  lastError: string | null;
  redeliveredFromId: string | null;
  createdAt: string;
}

export function mapWebhookDeliveryResponse(raw: unknown): WebhookDeliveryResponse {
  return {
    webhookDeliveryId: stringFieldOrNull(raw, 'webhookDeliveryId')!,
    webhookEndpointId: stringFieldOrNull(raw, 'webhookEndpointId')!,
    eventType: stringFieldOrNull(raw, 'eventType'),
    // sequenceNumber is int64 -- a string preserves precision even beyond Number.MAX_SAFE_INTEGER.
    sequenceNumber: String(field(raw, 'sequenceNumber')),
    status: WebhookDeliveryStatus.fromRaw(Number(field(raw, 'status'))),
    attemptCount: Number(field(raw, 'attemptCount')),
    maxAttempts: Number(field(raw, 'maxAttempts')),
    nextAttemptAt: stringFieldOrNull(raw, 'nextAttemptAt'),
    lastAttemptAt: stringFieldOrNull(raw, 'lastAttemptAt'),
    lastError: stringFieldOrNull(raw, 'lastError'),
    redeliveredFromId: stringFieldOrNull(raw, 'redeliveredFromId'),
    createdAt: stringField(raw, 'createdAt'),
  };
}

export interface ConfigureWebhookEndpointResult {
  webhookEndpointId: string;
  /** Only ever shown in this response -- never retrievable later (same invariant as GenerateApiKeyResult). */
  secret: string | null;
}

export function mapConfigureWebhookEndpointResult(raw: unknown): ConfigureWebhookEndpointResult {
  return { webhookEndpointId: stringFieldOrNull(raw, 'webhookEndpointId')!, secret: stringFieldOrNull(raw, 'secret') };
}

export interface RotateWebhookEndpointSecretResult {
  webhookEndpointId: string;
  secret: string | null;
}

export function mapRotateWebhookEndpointSecretResult(raw: unknown): RotateWebhookEndpointSecretResult {
  return { webhookEndpointId: stringFieldOrNull(raw, 'webhookEndpointId')!, secret: stringFieldOrNull(raw, 'secret') };
}

export interface RedeliverWebhookResult { webhookDeliveryId: string }
export function mapRedeliverWebhookResult(raw: unknown): RedeliverWebhookResult {
  return { webhookDeliveryId: stringFieldOrNull(raw, 'webhookDeliveryId')! };
}
