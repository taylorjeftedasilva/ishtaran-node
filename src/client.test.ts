import { describe, expect, it } from 'vitest';
import { IshtaranClient } from './client.js';
import { FakeHttpTransport } from './http/fakeHttpTransport.js';

describe('IshtaranClient Easy Mode composition (no network, via forTesting)', () => {
  it('withdraw composes createDestination + request, never hides the Network Fee', async () => {
    const destinationId = 'd-1111';
    const createDestBody = JSON.stringify({ withdrawalDestinationId: destinationId });
    const requestBody = JSON.stringify({
      withdrawalId: 'w-1', organizationId: 'org', accountId: 'acc', withdrawalDestinationId: destinationId,
      assetNetworkId: 'an', amount: 50, estimatedNetworkFee: 0.4, estimatedRecipientAmount: 49.6,
      finalNetworkFee: null, finalRecipientAmount: null, status: 0, entryGroupId: null,
      technicalReference: null, createdAt: '2026-08-17T12:00:00Z',
    });

    const fake = new FakeHttpTransport()
      .enqueue(FakeHttpTransport.json(201, createDestBody))
      .enqueue(FakeHttpTransport.json(201, requestBody));

    const client = IshtaranClient.forTesting(fake);

    const result = await client.withdraw('org', 'acc', 'an', '50', 'TDestReal', undefined);

    expect(result.withdrawalId).toBe('w-1');
    expect(result.estimatedNetworkFee).toBe('0.4');
    expect(result.estimatedRecipientAmount).toBe('49.6');
    expect(fake.requestCount).toBe(2);
  });

  it('withdraw skips createDestination when an existing destination id is given', async () => {
    const requestBody = JSON.stringify({
      withdrawalId: 'w-2', organizationId: 'org', accountId: 'acc', withdrawalDestinationId: 'existing-dest',
      assetNetworkId: 'an', amount: 10, estimatedNetworkFee: 0.1, estimatedRecipientAmount: 9.9,
      finalNetworkFee: null, finalRecipientAmount: null, status: 0, entryGroupId: null,
      technicalReference: null, createdAt: '2026-08-17T12:00:00Z',
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, requestBody));
    const client = IshtaranClient.forTesting(fake);

    await client.withdraw('org', 'acc', 'an', '10', 'unused-address', 'existing-dest');

    expect(fake.requestCount).toBe(1);
  });

  it('getBalance is a direct pass-through to ledger.getBalance', async () => {
    const body = JSON.stringify({ available: 100, pending: 0, reserved: 0 });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const client = IshtaranClient.forTesting(fake);

    const balance = await client.getBalance('acc', 'an');
    expect(balance.available).toBe('100');
  });

  it('verifyWebhookSignature makes no HTTP call', async () => {
    const fake = new FakeHttpTransport(); // no response queued -- would throw if called
    const client = IshtaranClient.forTesting(fake);

    const ts = Math.floor(Date.now() / 1000);
    const valid = client.verifyWebhookSignature('{}', 'deadbeef', String(ts), 'secret');
    expect(valid).toBe(false); // incorrect signature, but no throw/network call
    expect(fake.requestCount).toBe(0);
  });
});
