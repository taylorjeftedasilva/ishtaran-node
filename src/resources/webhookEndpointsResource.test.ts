import { describe, expect, it } from 'vitest';
import { WebhookEndpointsResource } from './webhookEndpointsResource.js';
import { FakeHttpTransport } from '../http/fakeHttpTransport.js';
import { WebhookDeliveryStatus } from '../model/enums.js';

describe('WebhookEndpointsResource', () => {
  it('listDeliveries sends status as a string NAME, not an integer (confirmed via Enum.Parse ignoreCase in source)', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, '[]'));
    const resource = new WebhookEndpointsResource(fake);

    await resource.listDeliveries('ep-1', undefined, WebhookDeliveryStatus.DELIVERED);

    expect(fake.received[0]!.path).toContain('status=DELIVERED');
  });

  it('listDeliveries eventType filter is URL-encoded via URLSearchParams, never injects extra params', async () => {
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(200, '[]'));
    const resource = new WebhookEndpointsResource(fake);

    await resource.listDeliveries('ep-1', 'payment.received&status=DELIVERED', undefined);

    const path = fake.received[0]!.path;
    expect(path).toContain('eventType=payment.received%26status%3DDELIVERED');
  });

  it('create exposes the secret only once, matching the real response shape', async () => {
    const body = JSON.stringify({ webhookEndpointId: 'ep-1', secret: 'whsec_abc123' });
    const fake = new FakeHttpTransport().enqueue(FakeHttpTransport.json(201, body));
    const resource = new WebhookEndpointsResource(fake);

    const result = await resource.create('org-1', 'https://example.com/webhook');

    expect(result.webhookEndpointId).toBe('ep-1');
    expect(result.secret).toBe('whsec_abc123');
  });
});
