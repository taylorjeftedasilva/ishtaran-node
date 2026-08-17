import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest, withHeader } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import {
  ApplicationResponse,
  CreatedResourceResponse,
  OrganizationResponse,
  mapApplicationResponse,
  mapCreatedResourceResponse,
  mapOrganizationResponse,
} from '../model/controlPlane.js';

/**
 * Control Plane — `Organizations` (6 rotas reais). Sempre Member JWT (nunca API Key — ver
 * SDK_CAPABILITY_SPEC.md §4). `create`/`createApplication` usam idempotência via HEADER
 * `Idempotency-Key` — diferente do padrão de campo de corpo dos módulos financeiros (ver
 * SDK_CAPABILITY_SPEC.md §9).
 */
export class OrganizationsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  /** Única rota real sem autenticação — ponto de entrada do sistema. */
  create(name: string, idempotencyKey?: string): Promise<CreatedResourceResponse> {
    const request = withHeader(
      postRequest('/v1/organizations', this.toJson({ name }), false),
      'Idempotency-Key',
      resolveIdempotencyKey(idempotencyKey),
    );
    return this.execute(request, mapCreatedResourceResponse);
  }

  get(organizationId: string): Promise<OrganizationResponse> {
    return this.execute(getRequest(`/v1/organizations/${organizationId}`), mapOrganizationResponse);
  }

  suspend(organizationId: string, reason?: string): Promise<void> {
    const body = this.toJson({ reason: reason ?? '' });
    return this.executeNoContent(postRequest(`/v1/organizations/${organizationId}/suspend`, body, false));
  }

  reactivate(organizationId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/organizations/${organizationId}/reactivate`, undefined, false));
  }

  listApplications(organizationId: string): Promise<ApplicationResponse[]> {
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/applications`), mapApplicationResponse);
  }

  createApplication(organizationId: string, name: string, idempotencyKey?: string): Promise<CreatedResourceResponse> {
    const request = withHeader(
      postRequest(`/v1/organizations/${organizationId}/applications`, this.toJson({ name }), false),
      'Idempotency-Key',
      resolveIdempotencyKey(idempotencyKey),
    );
    return this.execute(request, mapCreatedResourceResponse);
  }
}
