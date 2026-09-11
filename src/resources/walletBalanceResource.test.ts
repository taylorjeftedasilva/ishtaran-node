import { describe, expect, it } from 'vitest';
import { WalletBalanceResource } from './walletBalanceResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';

describe('WalletBalanceResource (Ishtaran Wallet Balance / On-Chain Balance capability, PROMPT 1)', () => {
  it('getBalance builds the correct querystring and maps the response', async () => {
    const body = JSON.stringify({
      accountId: 'acc-1',
      assetNetworkId: 'an-1',
      address: 'Txxx',
      balance: 0,
      observedAt: null,
      blockReference: null,
      source: null,
      stale: true,
      nextRefreshAllowedAt: null,
      refreshSuppressed: false,
      refreshFailureReason: null,
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new WalletBalanceResource(fake);

    const result = await resource.getBalance('acc-1', 'env-1', 'an-1');

    expect(result.balance).toBe('0');
    expect(result.stale).toBe(true);
    expect(result.observedAt).toBeNull();
    expect(fake.received[0]?.path).toBe('/v1/accounts/acc-1/wallet-balances?environmentId=env-1&assetNetworkId=an-1');
  });

  it('refreshBalance posts to the refresh route and never sends a client-declared balance', async () => {
    const body = JSON.stringify({
      accountId: 'acc-1',
      assetNetworkId: 'an-1',
      address: 'Txxx',
      balance: 20,
      observedAt: '2026-09-11T12:00:00Z',
      blockReference: null,
      source: 'sandbox',
      stale: false,
      nextRefreshAllowedAt: '2026-09-11T12:00:30Z',
      refreshSuppressed: false,
      refreshFailureReason: null,
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new WalletBalanceResource(fake);

    const result = await resource.refreshBalance('acc-1', 'env-1', 'an-1');

    expect(result.balance).toBe('20');
    expect(result.source).toBe('sandbox');
    expect(fake.received[0]?.path).toBe('/v1/accounts/acc-1/wallet-balances/refresh?environmentId=env-1&assetNetworkId=an-1');
    expect(fake.received[0]?.method).toBe('POST');
    expect(fake.received[0]?.body).toBeUndefined();
  });

  it('getAssetBalances joins assetNetworkIds and maps the aggregated response', async () => {
    const body = JSON.stringify([
      {
        assetId: 'usdt-asset',
        assetSymbol: 'USDT',
        aggregateBalance: 150,
        networkBalances: [
          { assetNetworkId: 'an-tron', networkCode: 'tron', balance: 100, observedAt: '2026-09-11T12:00:00Z', stale: false },
          { assetNetworkId: 'an-eth', networkCode: 'ethereum', balance: 50, observedAt: '2026-09-11T12:00:00Z', stale: false },
        ],
      },
    ]);
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new WalletBalanceResource(fake);

    const result = await resource.getAssetBalances('acc-1', 'env-1', ['an-tron', 'an-eth']);

    expect(result).toHaveLength(1);
    expect(result[0]?.aggregateBalance).toBe('150');
    expect(result[0]?.networkBalances).toHaveLength(2);
    expect(fake.received[0]?.path).toBe('/v1/accounts/acc-1/wallet-balances/aggregate?environmentId=env-1&assetNetworkIds=an-tron%2Can-eth');
  });
});
