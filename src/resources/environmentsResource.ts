import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { ApiKeyMetadataResponse, GenerateApiKeyResult, mapApiKeyMetadataResponse, mapGenerateApiKeyResult } from '../model/controlPlane.js';

/** Control Plane — `Environments` (2 rotas reais — sem rota real de get/list de Environment em si). */
export class EnvironmentsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  listApiKeys(environmentId: string): Promise<ApiKeyMetadataResponse[]> {
    return this.executeList(getRequest(`/v1/environments/${environmentId}/api-keys`), mapApiKeyMetadataResponse);
  }

  /** `plainTextKey` só aparece nesta resposta — nunca recuperável depois. */
  generateApiKey(environmentId: string): Promise<GenerateApiKeyResult> {
    return this.execute(postRequest(`/v1/environments/${environmentId}/api-keys`, '{}', false), mapGenerateApiKeyResult);
  }
}
