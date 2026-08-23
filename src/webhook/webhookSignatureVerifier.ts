import { createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

/**
 * Real webhook signature verification -- algorithm extracted byte for byte from
 * `WebhookSignatureCalculator.cs`/`HttpWebhookDeliveryPort.cs` (see SDK_CAPABILITY_SPEC.md §10):
 * `signedContent = "{unixTimestamp}.{rawBodyJson}"`,
 * `signature = lowercase_hex(HMAC_SHA256(secret, signedContent))`. Uses `rawBody` exactly as
 * received -- never reserializes the JSON before computing.
 */
export function computeWebhookSignature(unixTimestampSeconds: number, rawBody: string, endpointSecret: string): string {
  const signedContent = `${unixTimestampSeconds}.${rawBody}`;
  return createHmac('sha256', endpointSecret).update(signedContent, 'utf8').digest('hex');
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  timestampHeader: string,
  endpointSecret: string,
  toleranceSeconds: number = DEFAULT_TOLERANCE_SECONDS,
): boolean {
  if (!rawBody || !signatureHeader || !timestampHeader || !endpointSecret) {
    return false;
  }

  const timestampSeconds = Number.parseInt(timestampHeader.trim(), 10);
  if (Number.isNaN(timestampSeconds)) {
    return false;
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - timestampSeconds);
  if (ageSeconds > toleranceSeconds) {
    return false;
  }

  const expected = computeWebhookSignature(timestampSeconds, rawBody, endpointSecret);
  return constantTimeEquals(expected, signatureHeader.trim().toLowerCase());
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}
