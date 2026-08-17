# Webhooks

## Protocolo real

```
signedContent = "{timestamp}.{rawBodyJson}"
signature     = lowercase_hex(HMAC_SHA256(secret = endpointSecret, message = signedContent))
```

Headers: `X-Webhook-Signature`, `X-Webhook-Timestamp`, `X-Webhook-Delivery-Id`.

## Verificação (sem chamada HTTP)

```typescript
import express from 'express';

app.post('/webhooks/ishtaran', express.text({ type: '*/*' }), (req, res) => {
  const valid = client.verifyWebhookSignature(
    req.body, // rawBody EXATO -- nunca re-serializado
    req.header('X-Webhook-Signature')!,
    req.header('X-Webhook-Timestamp')!,
    endpointSecret,
  );
  if (!valid) return res.status(401).end();
  // processar o evento...
  res.status(200).end();
});
```

**Use sempre o `rawBody` exatamente como recebido.** Comparação em tempo constante
(`node:crypto.timingSafeEqual`), tolerância de replay de 5 minutos (padrão), nunca loga o secret.

## Gestão de endpoints (Core, requer Member JWT)

```typescript
const endpoint = await client.webhookEndpoints.create(organizationId, 'https://myapp.com/webhooks/ishtaran');
// endpoint.secret -- guarde AGORA, nunca recuperável depois

await client.webhookEndpoints.rotateSecret(endpoint.webhookEndpointId);
await client.webhookEndpoints.deactivate(endpoint.webhookEndpointId);
```
