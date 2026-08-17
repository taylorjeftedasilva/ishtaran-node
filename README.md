# Ishtaran TypeScript/Node.js SDK

SDK oficial em TypeScript/Node.js para a [API Ishtaran](https://ishtaran.com) — plataforma
financeira programável. Segunda implementação do [Ishtaran Official SDK Program](../../SDK_CAPABILITY_SPEC.md)
(Java → **TypeScript** → Python → Go), 100% de paridade funcional com o Java (SDK de referência).

## Duas camadas, mesmo backend

- **Easy Mode** — `client.receivePayment(...)`, `client.withdraw(...)`, `client.getBalance(...)`,
  `client.verifyWebhookSignature(...)`: composição rápida, nunca duplica lógica de negócio.
- **Core API** — `client.accounts`, `client.transactions`, `client.withdrawals`, etc.: acesso
  granular aos mesmos 83 endpoints reais da API (ver [`SDK_FEATURE_MATRIX.md`](../../SDK_FEATURE_MATRIX.md)).

## Instalação

Ainda não publicado no npm (decisão de licenciamento pendente). Para consumir localmente:

```bash
cd sdks/typescript
npm install && npm run build && npm pack
# no seu projeto:
npm install /caminho/para/ishtaran-sdk-1.0.0-SNAPSHOT.tgz
```

Requer **Node.js 18+**. ESM e CJS suportados (dual build).

## Quickstart

```typescript
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({
  apiKey: process.env.ISHTARAN_API_KEY,
  environment: Environment.Local, // ou Sandbox/Production com baseUrl explícito
});

const balance = await client.getBalance(accountId, assetNetworkId);
console.log('Available:', balance.available); // string exata, nunca number
```

Veja [`GETTING_STARTED.md`](GETTING_STARTED.md) e [`examples/`](examples/).

## Dinheiro é sempre string

Todo campo monetário (`amount`, `estimatedNetworkFee`, `available`, etc.) é tipado como `string` —
nunca `number`. A API real envia dinheiro como `number(double)` no JSON; `JSON.parse` nativo já
perderia precisão antes do SDK poder intervir, então todo parsing de resposta usa `lossless-json`,
preservando o texto exato de cada número. Ver [`SDK_CAPABILITY_SPEC.md` §11.1](../../SDK_CAPABILITY_SPEC.md#111-dinheiro).

## Documentação

| Documento | Conteúdo |
|---|---|
| [GETTING_STARTED.md](GETTING_STARTED.md) | Primeiro uso |
| [AUTHENTICATION.md](AUTHENTICATION.md) | `X-Api-Key` vs. Member JWT |
| [EASY_MODE.md](EASY_MODE.md) | Quando usar Easy Mode vs. Core |
| [CORE_API.md](CORE_API.md) | Cobertura completa de recursos |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | Hierarquia `IshtaranError` |
| [IDEMPOTENCY.md](IDEMPOTENCY.md) | Chave automática vs. explícita |
| [RETRIES.md](RETRIES.md) | Política de retry |
| [WEBHOOKS.md](WEBHOOKS.md) | Verificação de assinatura |
| [CONFIGURATION.md](CONFIGURATION.md) | Configuração do client |
| [SECURITY.md](SECURITY.md) | Segredos, TLS, redação |
| [FEATURES.md](FEATURES.md) | Cobertura de capacidades |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões |

Todo comportamento é extraído da API real, nunca inventado — ver [`SDK_CAPABILITY_SPEC.md`](../../SDK_CAPABILITY_SPEC.md).
