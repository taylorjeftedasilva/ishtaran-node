# Changelog

Segue [SemVer](https://semver.org/). Ainda não publicado (npm).

## [1.0.0-SNAPSHOT] — 2026-08-17

Segunda implementação do Ishtaran Official SDK Program — 100% de paridade funcional com o Java
(SDK de referência).

### Adicionado

- Client central (`IshtaranClient.create(...)`).
- Core API completo — 16 módulos, 93 operações reais.
- Easy Mode — `receivePayment`/`getPayment`/`waitForPayment`, `withdraw`, `getBalance`,
  `verifyWebhookSignature`.
- Autenticação `X-Api-Key` + Member JWT.
- Hierarquia `IshtaranError` completa.
- Retry seguro com backoff+jitter.
- Idempotência (body e header, conforme o endpoint real).
- Paginação real via async generators lazy.
- Enums forward-compatible (`fromRaw`/`isUnknown`, fallback `UNKNOWN`).
- Dinheiro sempre `string`, via `lossless-json` (nunca `Number`, nunca arredondado).
- `verifyWebhookSignature`/`computeWebhookSignature` (HMAC-SHA256, tempo constante).
- Logging opt-in com redação central.
- Empacotamento validado via `npm pack` + consumo real (ESM e CJS) por projeto de amostra.

### Conhecido, ainda pendente

- `connectTimeoutMs` aceito mas não imposto separadamente de `requestTimeoutMs` (ver `CONFIGURATION.md`).
- Publicação real no npm — bloqueada por decisão de licenciamento pendente.
