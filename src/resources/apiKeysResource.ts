import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, deleteRequest, postRequest } from '../http/types.js';
import { RotateApiKeyResult, mapRotateApiKeyResult } from '../model/controlPlane.js';
import { formatDotNetTimeSpan } from '../util/dotNetTimeSpan.js';

/** Control Plane -- `ApiKeys` (2 real routes). */
export class ApiKeysResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  revoke(apiKeyId: string): Promise<void> {
    return this.executeNoContent(deleteRequest(`/v1/api-keys/${apiKeyId}`));
  }

  /**
   * `overlapWindowMs` is sent in .NET's real `TimeSpan` format (not ISO-8601) -- see
   * {@link formatDotNetTimeSpan}. The new key's `plainTextKey` only ever appears in this response.
   */
  rotate(apiKeyId: string, overlapWindowMs: number): Promise<RotateApiKeyResult> {
    const body = this.toJson({ overlapWindow: formatDotNetTimeSpan(overlapWindowMs) });
    return this.execute(postRequest(`/v1/api-keys/${apiKeyId}/rotate`, body, false), mapRotateApiKeyResult);
  }
}
