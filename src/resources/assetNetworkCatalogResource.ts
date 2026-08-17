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
 * Catálogo — `AssetNetworkCatalog` (6 rotas reais, só leitura no escopo do SDK). Sempre Member JWT
 * — não aceita API Key hoje (Known Gap real, ver SDK_CAPABILITY_SPEC.md §12.3).
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
   * `status` é enviado como inteiro bruto na query string, per o contrato documentado do OpenAPI
   * real — mesmo a resposta devolvendo o status como string (Grupo A).
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
        throw new Error(`Valor de AssetNetworkStatus desconhecido para filtro: ${status.name}`);
    }
  }
}
