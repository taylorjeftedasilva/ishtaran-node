import { describe, expect, it } from 'vitest';
import { NetworkExecutionResource } from './networkExecutionResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';
import { NetworkCostPayer, NetworkOperationKind } from '../model/enums.js';

describe('NetworkExecutionResource', () => {
  it('quote posts operations + networkCostPayer and maps the full structured plan (INC-18 scaling proof)', async () => {
    const environmentId = 'env-1';
    const assetNetworkId = 'an-1';
    const body = JSON.stringify({
      network: 'TRON',
      plan: {
        assetNetworkId,
        transactions: [
          { transfers: [{ destinationAddress: 'Txxx1', amount: 40, sourceOperationReference: 'op-1' }] },
          { transfers: [{ destinationAddress: 'Txxx2', amount: 60, sourceOperationReference: 'op-2' }] },
        ],
      },
      estimatedResources: { lines: [{ resourceCode: 'ENERGY', quantity: 15000, unit: null }, { resourceCode: 'BANDWIDTH', quantity: 350, unit: null }] },
      nativeExecutionCost: 6.3,
      resourceAssetNetworkId: 'trx-network-id',
      quoteCurrency: 'USDT',
      fx: 0.12,
      safetyBuffer: 0.05,
      resourceSource: 1,
      replenishmentRequirement: null,
      conversionOverhead: 0.02,
      expiresAt: '2026-08-31T12:00:00Z',
      totalCharged: 3.16456,
      networkCostPayer: 0,
      authorizedNativeCost: 6.3,
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new NetworkExecutionResource(fake);

    const quote = await resource.quote(environmentId, assetNetworkId, [
      { destinationAddress: 'Txxx1', amount: '40', kind: NetworkOperationKind.TRANSFER!, reference: 'op-1' },
      { destinationAddress: 'Txxx2', amount: '60', kind: NetworkOperationKind.TRANSFER!, reference: 'op-2' },
    ], NetworkCostPayer.INTEGRATOR!);

    expect(fake.received[0]?.method).toBe('POST');
    expect(fake.received[0]?.path).toBe('/v1/environments/env-1/network-execution-quote');
    const sentBody = JSON.parse(fake.received[0]?.body as string);
    expect(sentBody.operations).toHaveLength(2);
    expect(sentBody.operations[0].amount).toBe(40);
    expect(sentBody.networkCostPayer).toBe(0);

    expect(quote.plan.transactions).toHaveLength(2);
    expect(quote.totalCharged).toBe('3.16456');
    expect(quote.authorizedNativeCost).toBe('6.3');
    expect(quote.resourceSource.name).toBe('SELF');
    expect(quote.networkCostPayer.name).toBe('INTEGRATOR');
    expect(quote.estimatedResources.lines.map((l) => l.resourceCode)).toEqual(['ENERGY', 'BANDWIDTH']);
  });

  it('quote accepts null operations (a size-only estimate)', async () => {
    const body = JSON.stringify({
      network: 'TRON', plan: { assetNetworkId: 'an-1', transactions: [] },
      estimatedResources: { lines: [] }, nativeExecutionCost: 0, resourceAssetNetworkId: null,
      quoteCurrency: null, fx: 1, safetyBuffer: 0, resourceSource: 0, replenishmentRequirement: null,
      conversionOverhead: 0, expiresAt: '2026-08-31T12:00:00Z', totalCharged: 0, networkCostPayer: 1,
      authorizedNativeCost: 0,
    });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, body));
    const resource = new NetworkExecutionResource(fake);

    await resource.quote('env-1', 'an-1', null, NetworkCostPayer.REQUESTER!);

    const sentBody = JSON.parse(fake.received[0]?.body as string);
    expect(sentBody.operations).toBeNull();
  });
});
