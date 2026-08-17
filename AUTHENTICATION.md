# Authentication

Dois mecanismos reais (ver `SDK_CAPABILITY_SPEC.md` §3) — idêntico em espírito ao Java SDK.

## `X-Api-Key` (recomendado)

```typescript
const client = IshtaranClient.create({ apiKey: '<sua API Key>', environment: Environment.Local });
```

Funciona em leitura e escrita nos 8 módulos Data Plane. Não funciona hoje para Control Plane
(Organizations/Applications/Environments/Members/ApiKeys), leitura de AssetNetworkCatalog, ou
gestão de WebhookEndpoint (lacunas reais da API, ver §12.3/§12.4).

## Member JWT (login humano)

```typescript
await client.auth.login(email, password);
// client agora usa o token internamente em toda chamada de Control Plane subsequente.
const org = await client.organizations.get(organizationId);
```

## Nunca misture disfarçadamente

O SDK nunca envia a API Key como Bearer nem o JWT como `X-Api-Key`. Se ambos estiverem
configurados, ambos os headers são enviados nas rotas Data Plane — evite configurá-los
simultaneamente contra Organizations diferentes (comportamento de precedência não verificado ao
vivo por este SDK).
