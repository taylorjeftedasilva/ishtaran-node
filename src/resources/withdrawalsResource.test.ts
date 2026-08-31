import { describe, expect, it } from 'vitest';
import { WithdrawalsResource } from './withdrawalsResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';
import { NotFoundError } from '../error/errors.js';

describe('WithdrawalsResource', () => {
  it('quote never writes anything, just returns the estimate, exposing the Network Fee', async () => {
    const accountId = 'a1111111-1111-1111-1111-111111111111';
    const destId = 'd2222222-2222-2222-2222-222222222222';
    const assetNetworkId = 'e3333333-3333-3333-3333-333333333333';

    const body = JSON.stringify({
      accountId, withdrawalDestinationId: destId, assetNetworkId,
      requestedAmount: 100, estimatedNetworkFee: null, estimatedRecipientAmount: 100,
      networkExecutionCost: 0.84364, expiresAt: '2026-08-17T12:00:00Z',
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new WithdrawalsResource(fake);

    const quote = await resource.quote('org-1', 'env-1', accountId, destId, assetNetworkId, '100');

    expect(quote.estimatedNetworkFee).toBeNull();
    expect(quote.estimatedRecipientAmount).toBe('100');
    expect(quote.networkExecutionCost).toBe('0.84364');
    expect(fake.requestCount).toBe(1);
    expect(fake.received[0]?.method).toBe('POST');
    expect(fake.received[0]?.path.endsWith('/withdrawals/quote')).toBe(true);
    // Regression: GetWithdrawalQuoteQuery/RequestWithdrawalCommand require EnvironmentId
    // server-side (RequestWithdrawalRequest.cs) -- omitting it from the body defaults to
    // Guid.Empty and fails FluentValidation with a 400 VALIDATION_ERROR, confirmed live 2026-08-31.
    expect(JSON.parse(fake.received[0]!.body as string).environmentId).toBe('env-1');
  });

  it('request auto-generates idempotency key when not provided', async () => {
    const body = JSON.stringify({
      withdrawalId: 'w1', organizationId: 'org-1', environmentId: 'env-1', accountId: 'a1',
      withdrawalDestinationId: 'd1', assetNetworkId: 'an1',
      amount: 100, estimatedNetworkFee: null, estimatedRecipientAmount: 100,
      finalNetworkFee: null, finalRecipientAmount: null,
      status: 0, entryGroupId: null, technicalReference: null,
      signingRequestId: 'sr-1', networkExecutionCost: 0.84364, networkExecutionCostStatus: 0,
      createdAt: '2026-08-17T12:00:00Z',
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, body));
    const resource = new WithdrawalsResource(fake);

    const result = await resource.request('org-1', 'env-1', 'a1', 'd1', 'an1', '100');

    expect(result.status.name).toBe('REQUESTED');
    expect(result.signingRequestId).toBe('sr-1');
    expect(result.networkExecutionCost).toBe('0.84364');
    expect(result.networkExecutionCostStatus?.name).toBe('RESERVED');
    expect(fake.received[0]?.body).toContain('idempotencyKey');
    expect(JSON.parse(fake.received[0]!.body as string).environmentId).toBe('env-1');
  });

  it('get not found maps to NotFoundError', async () => {
    const body = JSON.stringify({ status: 404, detail: 'Withdrawal not found', code: 'NOT_FOUND' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(404, body));
    const resource = new WithdrawalsResource(fake);

    await expect(resource.get('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});
