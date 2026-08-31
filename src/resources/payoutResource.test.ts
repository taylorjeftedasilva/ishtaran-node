import { describe, expect, it } from 'vitest';
import { PayoutResource } from './payoutResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';

describe('PayoutResource', () => {
  it('getPayableSummary reads accrued/reservedForPayout/paid, never Available', async () => {
    const body = JSON.stringify({ accrued: 40, reservedForPayout: 0, paid: 60 });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new PayoutResource(fake);

    const summary = await resource.getPayableSummary('acc-1', 'an-1');

    expect(summary.accrued).toBe('40');
    expect(summary.reservedForPayout).toBe('0');
    expect(summary.paid).toBe('60');
    expect(fake.received[0]?.path).toBe('/v1/accounts/acc-1/payable-summary?assetNetworkId=an-1');
  });

  it('createBatch auto-generates an idempotency key and maps the created id', async () => {
    const body = JSON.stringify({ payoutBatchId: 'pb-1' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, body));
    const resource = new PayoutResource(fake);

    const result = await resource.createBatch('org-1', 'env-1', 'an-1', null);

    expect(result.payoutBatchId).toBe('pb-1');
    expect(fake.received[0]?.body).toContain('idempotencyKey');
  });

  it('createBatch maps 204 No Content (no eligible candidates) to a null payoutBatchId, never an error', async () => {
    const fake = new FakeHttpTransport().enqueue({ status: 204, headers: {}, body: '' });
    const resource = new PayoutResource(fake);

    const result = await resource.createBatch('org-1', 'env-1', 'an-1', ['owner-1', 'owner-2']);

    expect(result.payoutBatchId).toBeNull();
  });

  it('getBatch maps the full obligation tree + quote snapshot', async () => {
    const body = JSON.stringify({
      payoutBatchId: 'pb-1', organizationId: 'org-1', environmentId: 'env-1', assetNetworkId: 'an-1',
      trigger: 2, status: 3,
      obligations: [{
        ownerId: 'owner-1', amount: 100,
        sourceObligations: [{ originReference: 'settlement:s1', amount: 100 }],
        destinationAddress: 'Txxx', status: 1,
      }],
      networkExecutionQuoteSnapshot: {
        network: 'TRON', nativeExecutionCost: 6.3, resourceAssetNetworkId: 'trx-an', quoteCurrency: 'USDT',
        fx: 0.12, totalCharged: 3.16456, authorizedNativeCost: 6.3, expiresAt: '2026-08-31T12:00:00Z',
      },
      signingRequestId: 'sr-1', createdAt: '2026-08-31T11:00:00Z',
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new PayoutResource(fake);

    const batch = await resource.getBatch('org-1', 'pb-1');

    expect(batch.trigger.name).toBe('MANUAL');
    expect(batch.status.name).toBe('COMPLETED');
    expect(batch.obligations[0]?.status.name).toBe('CONFIRMED');
    expect(batch.obligations[0]?.sourceObligations[0]?.amount).toBe('100');
    expect(batch.networkExecutionQuoteSnapshot.totalCharged).toBe('3.16456');
  });
});
