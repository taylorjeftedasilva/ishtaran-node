# Configuration

```typescript
const client = IshtaranClient.create({
  apiKey: '...',
  environment: Environment.Local,
  baseUrl: 'http://localhost:8080', // sempre explícito quando presente
  connectTimeoutMs: 5000,           // default
  requestTimeoutMs: 30000,          // default
  enableLogging: true,              // opt-in, nunca ligado por padrão
});
```

## `baseUrl`/`Environment`

| Environment | Default | `baseUrl` explícito? |
|---|---|---|
| `Local` | `http://localhost:8080` | Não |
| `Sandbox`/`Production` | **nenhum** — infra ainda não provisionada | **Sim, obrigatório** |

Construir sem `baseUrl` para `Sandbox`/`Production` lança imediatamente — nunca aponta para uma URL
inventada.

## Limitação conhecida — timeout

`connectTimeoutMs` é aceito na configuração (paridade com os outros SDKs) mas ainda não é imposto
separadamente de `requestTimeoutMs` nesta versão — só o timeout total
(`AbortSignal.timeout(requestTimeoutMs)`) é aplicado sobre o `fetch` nativo. Documentado, não
escondido.

## TLS

Verificado por padrão (comportamento nativo do `fetch`); nunca desabilitado por este SDK.

## User-Agent

`ishtaran-node/<versão>` — fixo, sem dado pessoal.
