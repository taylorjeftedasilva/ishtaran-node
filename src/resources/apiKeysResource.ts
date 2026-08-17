import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, deleteRequest, postRequest } from '../http/types.js';
import { RotateApiKeyResult, mapRotateApiKeyResult } from '../model/controlPlane.js';
import { formatDotNetTimeSpan } from '../util/dotNetTimeSpan.js';

/** Control Plane — `ApiKeys` (2 rotas reais). */
export class ApiKeysResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  revoke(apiKeyId: string): Promise<void> {
    return this.executeNoContent(deleteRequest(`/v1/api-keys/${apiKeyId}`));
  }

  /**
   * `overlapWindowMs` é enviado no formato real de `TimeSpan` do .NET (não ISO-8601) — ver
   * {@link formatDotNetTimeSpan}. `plainTextKey` da nova chave só aparece nesta resposta.
   */
  rotate(apiKeyId: string, overlapWindowMs: number): Promise<RotateApiKeyResult> {
    const body = this.toJson({ overlapWindow: formatDotNetTimeSpan(overlapWindowMs) });
    return this.execute(postRequest(`/v1/api-keys/${apiKeyId}/rotate`, body, false), mapRotateApiKeyResult);
  }
}
