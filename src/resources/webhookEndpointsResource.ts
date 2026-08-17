import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import {
  ConfigureWebhookEndpointResult,
  RotateWebhookEndpointSecretResult,
  WebhookDeliveryResponse,
  WebhookEndpointResponse,
  mapConfigureWebhookEndpointResult,
  mapRotateWebhookEndpointSecretResult,
  mapWebhookDeliveryResponse,
  mapWebhookEndpointResponse,
} from '../model/webhookEndpoints.js';
import { EnumValue } from '../model/enumFactory.js';

/**
 * Control Plane (gestão) — `WebhookEndpoints` (6 rotas reais). Sempre Member JWT — não aceita API
 * Key hoje (Known Gap real, ver SDK_CAPABILITY_SPEC.md §12.4). Verificação de assinatura em si
 * (`verifyWebhookSignature`) nunca faz chamada HTTP.
 */
export class WebhookEndpointsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  /** `secret` só é retornado aqui — guarde-o imediatamente, nunca recuperável depois. */
  create(organizationId: string, url: string): Promise<ConfigureWebhookEndpointResult> {
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/webhook-endpoints`, this.toJson({ url }), false),
      mapConfigureWebhookEndpointResult,
    );
  }

  list(organizationId: string): Promise<WebhookEndpointResponse[]> {
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/webhook-endpoints`), mapWebhookEndpointResponse);
  }

  get(webhookEndpointId: string): Promise<WebhookEndpointResponse> {
    return this.execute(getRequest(`/v1/webhook-endpoints/${webhookEndpointId}`), mapWebhookEndpointResponse);
  }

  /** Novo `secret` — o anterior deixa de validar assinaturas imediatamente. */
  rotateSecret(webhookEndpointId: string): Promise<RotateWebhookEndpointSecretResult> {
    return this.execute(postRequest(`/v1/webhook-endpoints/${webhookEndpointId}/rotate-secret`, undefined, false), mapRotateWebhookEndpointSecretResult);
  }

  deactivate(webhookEndpointId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/webhook-endpoints/${webhookEndpointId}/deactivate`, undefined, false));
  }

  /**
   * `status` é enviado como NOME (string, case-insensitive) na query string — diferente do filtro
   * de `AssetNetworkCatalog` que usa inteiro (confirmado em código-fonte:
   * `Enum.Parse<WebhookDeliveryStatus>(status, ignoreCase: true)`).
   */
  listDeliveries(webhookEndpointId: string, eventType: string | undefined, status: EnumValue<number> | undefined): Promise<WebhookDeliveryResponse[]> {
    const query = new URLSearchParams();
    if (eventType) query.set('eventType', eventType);
    if (status) query.set('status', status.name);
    const suffix = query.toString() ? `?${query}` : '';
    return this.executeList(getRequest(`/v1/webhook-endpoints/${webhookEndpointId}/deliveries${suffix}`), mapWebhookDeliveryResponse);
  }
}
