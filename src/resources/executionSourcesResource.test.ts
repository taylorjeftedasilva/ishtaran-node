import { describe, expect, it } from 'vitest';
import { ExecutionSourcesResource } from './executionSourcesResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';

describe('ExecutionSourcesResource', () => {
  it('register posts the derivation reference and address, maps the created id', async () => {
    const body = JSON.stringify({ executionSourceId: 'es-1' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, body));
    const resource = new ExecutionSourcesResource(fake);

    const result = await resource.register('org-1', 'env-1', 'an-1', 'wallet-1', 42, 'Txxx');

    expect(result.executionSourceId).toBe('es-1');
    expect(fake.received[0]?.method).toBe('POST');
    expect(fake.received[0]?.path).toBe('/v1/organizations/org-1/execution-sources');
    const sentBody = JSON.parse(fake.received[0]?.body as string);
    expect(sentBody).toEqual({ environmentId: 'env-1', assetNetworkId: 'an-1', walletId: 'wallet-1', derivationReference: 42, address: 'Txxx' });
  });

  it('syncResourceStake posts the declared capacity to the resource-stake route', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(204, ''));
    const resource = new ExecutionSourcesResource(fake);

    await resource.syncResourceStake('org-1', 'es-1', '100', '20000', '500');

    expect(fake.received[0]?.method).toBe('POST');
    expect(fake.received[0]?.path).toBe('/v1/organizations/org-1/execution-sources/es-1/resource-stake');
    const sentBody = JSON.parse(fake.received[0]?.body as string);
    expect(sentBody).toEqual({ availableNativeAmount: 100, availableEnergy: 20000, availableBandwidth: 500 });
  });
});
