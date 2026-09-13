import { describe, expect, it } from 'vitest';
import { TransfersResource } from './transfersResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';

describe('TransfersResource', () => {
  it('request to an internal Account, auto-generates idempotency key when not provided', async () => {
    // PROMPT 7.1/BR-TRF-008 (found live 2026-09-12) -- the creation endpoint itself only ever
    // acknowledges {transferId} (same convention as every other POST .../transfers-shaped route
    // in this platform) -- request() must follow up with a real GET to return a populated result.
    const createAck = JSON.stringify({ transferId: 't1' });
    const fullBody = JSON.stringify({
      transferId: 't1', organizationId: 'org-1', applicationId: 'app-1', environmentId: 'env-1',
      sourceAccountId: 'a1', assetNetworkId: 'an1', amount: 100, destinationAddress: 'TRecipient...',
      destinationAccountId: 'a2', platformFeeAmount: 0.2, platformFeePercentage: 0.2,
      // request() ends in AwaitingSignature (real SigningRequest just created), never Confirmed
      // synchronously; the client still has to sign+submit each Leg.
      status: 1, signingRequestId: 'sr-1',
      createdAt: '2026-09-12T12:00:00Z', confirmedAt: null, failureReason: null,
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, createAck)).enqueue(FakeHttpTransport.json(200, fullBody));
    const resource = new TransfersResource(fake);

    const result = await resource.request('org-1', 'app-1', 'env-1', 'a1', 'an1', '100', { accountId: 'a2' });

    expect(result.status.name).toBe('AWAITING_SIGNATURE');
    expect(result.signingRequestId).toBe('sr-1');
    // BR-TRF-004 -- amount is exactly what the recipient receives; the fee is separate.
    expect(result.amount).toBe('100');
    expect(result.platformFeeAmount).toBe('0.2');
    expect(fake.requestCount).toBe(2);
    expect(fake.received[0]!.method).toBe('POST');
    expect(fake.received[1]!.method).toBe('GET');
    expect(fake.received[1]!.path).toBe('/v1/transfers/t1');
    const sentBody = JSON.parse(fake.received[0]!.body as string);
    expect(sentBody.destinationAccountId).toBe('a2');
    expect(sentBody.destinationAddress).toBeNull();
    expect(typeof sentBody.idempotencyKey).toBe('string');
    expect(sentBody.idempotencyKey.length).toBeGreaterThan(0);
  });

  it('request to an external address never requires pre-registration -- destinationAddress goes straight through', async () => {
    const createAck = JSON.stringify({ transferId: 't2' });
    const fullBody = JSON.stringify({
      transferId: 't2', organizationId: 'org-1', applicationId: 'app-1', environmentId: 'env-1',
      sourceAccountId: 'a1', assetNetworkId: 'an1', amount: 50, destinationAddress: 'TExternalAddress...',
      destinationAccountId: null, platformFeeAmount: 0.1, platformFeePercentage: 0.2,
      status: 0, signingRequestId: null, createdAt: '2026-09-12T12:00:00Z', confirmedAt: null, failureReason: null,
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, createAck)).enqueue(FakeHttpTransport.json(200, fullBody));
    const resource = new TransfersResource(fake);

    const result = await resource.request('org-1', 'app-1', 'env-1', 'a1', 'an1', '50', { address: 'TExternalAddress...' }, 'my-key');

    expect(result.destinationAccountId).toBeNull();
    expect(result.destinationAddress).toBe('TExternalAddress...');
    const sentBody = JSON.parse(fake.received[0]!.body as string);
    expect(sentBody.destinationAddress).toBe('TExternalAddress...');
    expect(sentBody.destinationAccountId).toBeNull();
    expect(sentBody.idempotencyKey).toBe('my-key');
  });

  it('get maps a Failed transfer, exposing failureReason', async () => {
    const body = JSON.stringify({
      transferId: 't3', organizationId: 'org-1', applicationId: 'app-1', environmentId: 'env-1',
      sourceAccountId: 'a1', assetNetworkId: 'an1', amount: 100, destinationAddress: 'TX...',
      destinationAccountId: null, platformFeeAmount: 0.2, platformFeePercentage: 0.2,
      status: 4, signingRequestId: 'sr-3', createdAt: '2026-09-12T12:00:00Z', confirmedAt: null, failureReason: 'Insufficient balance',
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new TransfersResource(fake);

    const result = await resource.get('t3');

    expect(result.status.name).toBe('FAILED');
    expect(result.failureReason).toBe('Insufficient balance');
  });
});
