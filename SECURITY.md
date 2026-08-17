# Security

Ver `SECURITY_REVIEW.md` para o checklist formal completo.

## Segredos nunca vazam

`apiKey`/`endpointSecret`/tokens nunca aparecem em log, exceção, ou serialização.
`describeConfig()` mascara a API Key. Logging opt-in nunca loga `Authorization`/`X-Api-Key` em
texto puro nem o corpo bruto.

## TLS

Verificado por padrão (comportamento nativo do `fetch`), sem switch de desabilitar exposto por
este SDK.

## Webhook

`node:crypto.timingSafeEqual` (tempo constante real), valida timestamp contra replay, nunca loga o
secret.

## Dependências

Mínimas: `lossless-json` (única dependência de produção — precisão de dinheiro, ver
`SDK_CAPABILITY_SPEC.md` §11.1). `node:crypto`/`node:fetch` nativos, zero dependência de terceiros
para transporte/HMAC.
