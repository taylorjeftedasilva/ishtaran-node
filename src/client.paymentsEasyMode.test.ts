import { describe, expect, it } from 'vitest';
import { IshtaranClient } from './client.js';
import { FakeHttpTransport } from './http/fakeHttpTransport.js';
import { TimeoutError } from './error/errors.js';

function transactionJson(transactionId: string, status: number): string {
  return JSON.stringify({
    transactionId, organizationId: 'org', applicationId: 'app', environmentId: 'env', workflowVersionId: null,
    currentWorkflowStateId: null, assetNetworkId: 'an', amount: 100, status,
    payerAccountId: 'payer', participants: [], createdAt: '2026-08-17T12:00:00Z',
    settledAmount: 0, refundedAmount: 0,
  });
}

function paymentIntentJson(paymentIntentId: string, transactionId: string, status: number, depositAddress: string): string {
  return JSON.stringify({
    paymentIntentId, organizationId: 'org', transactionId, assetNetworkId: 'an',
    amount: 100, status, expiresAt: null, depositAddress, deposits: [], createdAt: '2026-08-17T12:00:00Z',
  });
}

describe('IshtaranClient Easy Mode payments composition (no network)', () => {
  it('receivePayment composes Transaction + PaymentIntent, exposing the real Core ids', async () => {
    const transactionId = 't-1';
    const paymentIntentId = 'pi-1';

    const fake = new FakeHttpTransport()
      .enqueue(FakeHttpTransport.json(201, JSON.stringify({ transactionId })))
      .enqueue(FakeHttpTransport.json(201, JSON.stringify({ paymentIntentId })))
      .enqueue(FakeHttpTransport.json(200, transactionJson(transactionId, 0)))
      .enqueue(FakeHttpTransport.json(200, paymentIntentJson(paymentIntentId, transactionId, 0, 'TDeposit1real')));

    const client = IshtaranClient.forTesting(fake);

    const result = await client.receivePayment('org', 'app', 'env', 'payer', 'recipient', 'an', '100');

    expect(result.transactionId).toBe(transactionId);
    expect(result.paymentIntentId).toBe(paymentIntentId);
    expect(result.depositAddress).toBe('TDeposit1real');
    expect(fake.requestCount).toBe(4);
  });

  it('waitForPayment polls until Paid', async () => {
    const transactionId = 't-2';
    const paymentIntentId = 'pi-2';

    const fake = new FakeHttpTransport()
      .enqueue(FakeHttpTransport.json(200, transactionJson(transactionId, 0)))
      .enqueue(FakeHttpTransport.json(200, paymentIntentJson(paymentIntentId, transactionId, 0, 'addr')))
      .enqueue(FakeHttpTransport.json(200, transactionJson(transactionId, 4)))
      .enqueue(FakeHttpTransport.json(200, paymentIntentJson(paymentIntentId, transactionId, 2, 'addr')));

    const client = IshtaranClient.forTesting(fake);

    const result = await client.waitForPayment(transactionId, paymentIntentId, 5000, 1);

    expect(result).toBeDefined();
    expect(fake.requestCount).toBe(4);
  });

  it('waitForPayment never resolving throws TimeoutError, never hangs forever', async () => {
    const transactionId = 't-3';
    const paymentIntentId = 'pi-3';

    const fake = new FakeHttpTransport().respondAlways((req) =>
      req.path.includes('/transactions/')
        ? FakeHttpTransport.json(200, transactionJson(transactionId, 0))
        : FakeHttpTransport.json(200, paymentIntentJson(paymentIntentId, transactionId, 0, 'addr')),
    );
    const client = IshtaranClient.forTesting(fake);

    await expect(client.waitForPayment(transactionId, paymentIntentId, 20, 5)).rejects.toBeInstanceOf(TimeoutError);
  });
});
