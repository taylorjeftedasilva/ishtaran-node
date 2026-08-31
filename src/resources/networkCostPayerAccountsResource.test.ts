import { describe, expect, it } from 'vitest';
import { NetworkCostPayerAccountsResource } from './networkCostPayerAccountsResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';
import { ConflictError } from '../error/errors.js';

describe('NetworkCostPayerAccountsResource', () => {
  it('register posts assetNetworkId + accountId, maps the created id', async () => {
    const body = JSON.stringify({ networkCostPayerAccountId: 'ncpa-1' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, body));
    const resource = new NetworkCostPayerAccountsResource(fake);

    const result = await resource.register('org-1', 'an-1', 'acc-1');

    expect(result.networkCostPayerAccountId).toBe('ncpa-1');
    expect(fake.received[0]?.path).toBe('/v1/organizations/org-1/network-cost-payer-accounts');
  });

  it('a cross-tenant Account is rejected (mapped to a 4xx error, never a raw 500)', async () => {
    const body = JSON.stringify({ status: 409, detail: 'Account does not belong to this Organization', code: 'CONFLICT' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(409, body));
    const resource = new NetworkCostPayerAccountsResource(fake);

    await expect(resource.register('org-1', 'an-1', 'someone-elses-account')).rejects.toBeInstanceOf(ConflictError);
  });
});
