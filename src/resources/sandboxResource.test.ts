import { describe, expect, it } from 'vitest';
import { SandboxResource } from './sandboxResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';

describe('SandboxResource wallet balance (wallet-payment-app GAPS.md G.8)', () => {
  it('creditWalletBalance posts address/assetNetworkId/amount/idempotencyKey and maps the resulting balance', async () => {
    const body = JSON.stringify({ environmentId: 'env-1', assetNetworkId: 'an-1', address: 'Txxx', balance: 20, updatedAt: '2026-09-10T12:00:00Z' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new SandboxResource(fake);

    const result = await resource.creditWalletBalance('env-1', 'Txxx', 'an-1', '20', 'idem-1');

    expect(result.balance).toBe('20');
    expect(fake.received[0]?.path).toBe('/v1/environments/env-1/sandbox/wallet-balance/credit');
    expect(fake.received[0]?.body).toContain('"idempotencyKey":"idem-1"');
  });

  it('transferWalletBalance posts fromAddress/toAddress and maps both post-transfer balances', async () => {
    const body = JSON.stringify({ fromAddress: 'Tfrom', fromBalanceAfter: 10, toAddress: 'Tto', toBalanceAfter: 15, occurredAt: '2026-09-10T12:00:00Z' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new SandboxResource(fake);

    const result = await resource.transferWalletBalance('env-1', 'Tfrom', 'Tto', 'an-1', '10', 'idem-2');

    expect(result.fromBalanceAfter).toBe('10');
    expect(result.toBalanceAfter).toBe('15');
    expect(fake.received[0]?.path).toBe('/v1/environments/env-1/sandbox/wallet-balance/transfer');
  });

  it('getWalletBalance builds the correct querystring and maps the balance', async () => {
    const body = JSON.stringify({ environmentId: 'env-1', assetNetworkId: 'an-1', address: 'Txxx', balance: 0, updatedAt: '2026-09-10T12:00:00Z' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new SandboxResource(fake);

    const result = await resource.getWalletBalance('env-1', 'an-1', 'Txxx');

    expect(result.balance).toBe('0');
    expect(fake.received[0]?.path).toBe('/v1/environments/env-1/sandbox/wallet-balance?assetNetworkId=an-1&address=Txxx');
  });
});
