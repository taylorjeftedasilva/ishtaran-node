import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, postRequest } from '../http/types.js';
import { CreatedResourceResponse, mapCreatedResourceResponse } from '../model/controlPlane.js';
import { EnumValue } from '../model/enumFactory.js';

/** Control Plane -- `Applications` (4 real routes, plus create in {@link OrganizationsResource}). */
export class ApplicationsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  archive(applicationId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/applications/${applicationId}/archive`, undefined, false));
  }

  suspend(applicationId: string, reason?: string): Promise<void> {
    const body = this.toJson({ reason: reason ?? '' });
    return this.executeNoContent(postRequest(`/v1/applications/${applicationId}/suspend`, body, false));
  }

  reactivate(applicationId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/applications/${applicationId}/reactivate`, undefined, false));
  }

  createEnvironment(applicationId: string, type: EnumValue<number>): Promise<CreatedResourceResponse> {
    const body = this.toJson({ type: type.rawValue });
    return this.execute(postRequest(`/v1/applications/${applicationId}/environments`, body, false), mapCreatedResourceResponse);
  }
}
