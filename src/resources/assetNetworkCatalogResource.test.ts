import { describe, expect, it } from 'vitest';
import { AssetNetworkCatalogResource } from './assetNetworkCatalogResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';
import { AssetNetworkStatus } from '../model/enums.js';

describe('AssetNetworkCatalogResource status filter (int, not string)', () => {
  it('sends the status filter as a raw integer in the query string', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, '[]'));
    const resource = new AssetNetworkCatalogResource(fake);

    await resource.listAssetNetworks(AssetNetworkStatus.PAUSED);

    expect(fake.received[0]!.path).toContain('status=2');
  });

  it('omits the status param when no filter is given', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, '[]'));
    const resource = new AssetNetworkCatalogResource(fake);

    await resource.listAssetNetworks();

    expect(fake.received[0]!.path).not.toContain('status=');
  });
});
