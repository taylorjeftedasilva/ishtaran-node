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
 * Control Plane (management) -- `WebhookEndpoints` (6 real routes). Always Member JWT -- doesn't
 * accept an API Key today (a real Known Gap, see SDK_CAPABILITY_SPEC.md §12.4). Signature
 * verification itself (`verifyWebhookSignature`) never makes an HTTP call.
 */
export class WebhookEndpointsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  /** `secret` is only ever returned here -- save it immediately, it can never be retrieved later. */
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

  /** New `secret` -- the previous one stops validating signatures immediately. */
  rotateSecret(webhookEndpointId: string): Promise<RotateWebhookEndpointSecretResult> {
    return this.execute(postRequest(`/v1/webhook-endpoints/${webhookEndpointId}/rotate-secret`, undefined, false), mapRotateWebhookEndpointSecretResult);
  }

  deactivate(webhookEndpointId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/webhook-endpoints/${webhookEndpointId}/deactivate`, undefined, false));
  }

  /**
   * `status` is sent as the NAME (string, case-insensitive) in the query string -- unlike
   * `AssetNetworkCatalog`'s filter, which uses an integer (confirmed in source:
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
