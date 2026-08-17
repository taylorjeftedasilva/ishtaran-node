import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { RedeliverWebhookResult, WebhookDeliveryResponse, mapRedeliverWebhookResult, mapWebhookDeliveryResponse } from '../model/webhookEndpoints.js';

/** Control Plane (gestão) — `WebhookDeliveries` (2 rotas reais, mesmo módulo `Notifications`). */
export class WebhookDeliveriesResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  get(webhookDeliveryId: string): Promise<WebhookDeliveryResponse> {
    return this.execute(getRequest(`/v1/webhook-deliveries/${webhookDeliveryId}`), mapWebhookDeliveryResponse);
  }

  redeliver(webhookDeliveryId: string): Promise<RedeliverWebhookResult> {
    return this.execute(postRequest(`/v1/webhook-deliveries/${webhookDeliveryId}/redeliver`, undefined, false), mapRedeliverWebhookResult);
  }
}
