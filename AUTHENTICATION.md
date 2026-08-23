# Authentication

Two real mechanisms (see `SDK_CAPABILITY_SPEC.md` §3) — identical in spirit to the Java SDK.

## `X-Api-Key` (recommended)

```typescript
const client = IshtaranClient.create({ apiKey: '<your API Key>', environment: Environment.Local });
```

Works for read and write on the 8 Data Plane modules. Does not work today for Control Plane
(Organizations/Applications/Environments/Members/ApiKeys), reading the AssetNetworkCatalog, or
WebhookEndpoint management (real API gaps, see §12.3/§12.4).

## Member JWT (human login)

```typescript
await client.auth.login(email, password);
// the client now uses the token internally for every subsequent Control Plane call.
const org = await client.organizations.get(organizationId);
```

## Never mix them silently

The SDK never sends the API Key as a Bearer token nor the JWT as `X-Api-Key`. If both are
configured, both headers are sent on Data Plane routes — avoid configuring both at once
against different Organizations (precedence behavior not verified live by this SDK).
