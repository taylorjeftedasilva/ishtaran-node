# Webhooks

## Real protocol

```
signedContent = "{timestamp}.{rawBodyJson}"
signature     = lowercase_hex(HMAC_SHA256(secret = endpointSecret, message = signedContent))
```

Headers: `X-Webhook-Signature`, `X-Webhook-Timestamp`, `X-Webhook-Delivery-Id`.

## Verification (no HTTP call)

```typescript
import express from 'express';

app.post('/webhooks/ishtaran', express.text({ type: '*/*' }), (req, res) => {
  const valid = client.verifyWebhookSignature(
    req.body, // EXACT rawBody -- never re-serialized
    req.header('X-Webhook-Signature')!,
    req.header('X-Webhook-Timestamp')!,
    endpointSecret,
  );
  if (!valid) return res.status(401).end();
  // process the event...
  res.status(200).end();
});
```

**Always use `rawBody` exactly as received.** Constant-time comparison
(`node:crypto.timingSafeEqual`), 5-minute replay tolerance (default), never logs the secret.

## Endpoint management (Core, requires Member JWT)

```typescript
const endpoint = await client.webhookEndpoints.create(organizationId, 'https://myapp.com/webhooks/ishtaran');
// endpoint.secret -- save it NOW, never retrievable afterward

await client.webhookEndpoints.rotateSecret(endpoint.webhookEndpointId);
await client.webhookEndpoints.deactivate(endpoint.webhookEndpointId);
```
