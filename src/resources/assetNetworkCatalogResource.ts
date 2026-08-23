import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest } from '../http/types.js';
import {
  AssetNetworkResponse,
  AssetResponse,
  NetworkResponse,
  mapAssetNetworkResponse,
  mapAssetResponse,
  mapNetworkResponse,
} from '../model/controlPlane.js';
import { EnumValue } from '../model/enumFactory.js';

/**
 * Catalog -- `AssetNetworkCatalog` (6 real routes, read-only within the SDK's scope). Always
 * Member JWT -- doesn't accept an API Key today (a real Known Gap, see SDK_CAPABILITY_SPEC.md §12.3).
 */
export class AssetNetworkCatalogResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  listAssets(): Promise<AssetResponse[]> {
    return this.executeList(getRequest('/v1/assets'), mapAssetResponse);
  }

  getAsset(assetId: string): Promise<AssetResponse> {
    return this.execute(getRequest(`/v1/assets/${assetId}`), mapAssetResponse);
  }

  listNetworks(): Promise<NetworkResponse[]> {
    return this.executeList(getRequest('/v1/networks'), mapNetworkResponse);
  }

  getNetwork(networkId: string): Promise<NetworkResponse> {
    return this.execute(getRequest(`/v1/networks/${networkId}`), mapNetworkResponse);
  }

  /**
   * `status` is sent as a raw integer in the query string, per the real documented OpenAPI
   * contract -- even though the response returns status as a string (Group A).
   */
  listAssetNetworks(status?: EnumValue<string>): Promise<AssetNetworkResponse[]> {
    const path = status ? `/v1/asset-networks?status=${this.toRequestRawValue(status)}` : '/v1/asset-networks';
    return this.executeList(getRequest(path), mapAssetNetworkResponse);
  }

  getAssetNetwork(assetNetworkId: string): Promise<AssetNetworkResponse> {
    return this.execute(getRequest(`/v1/asset-networks/${assetNetworkId}`), mapAssetNetworkResponse);
  }

  private toRequestRawValue(status: EnumValue<string>): number {
    switch (status.name) {
      case 'ENABLED':
        return 1;
      case 'PAUSED':
        return 2;
      case 'DISABLED':
        return 3;
      default:
        throw new Error(`Unknown AssetNetworkStatus value for filter: ${status.name}`);
    }
  }
}
