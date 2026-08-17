# Features

Derivado de [`SDK_FEATURE_MATRIX.md`](../../SDK_FEATURE_MATRIX.md). Core API: 93/93 operações
reais (16/16 módulos). Easy Mode: 100% (`payments.*`, `withdraw`, `getBalance`,
`verifyWebhookSignature`). Cross-cutting: 100% (config, auth, erros, retry, idempotência,
paginação, enums forward-compatible, segurança/redação, logging opt-in, waitFor seguro,
empacotamento validado ESM+CJS).

100% de paridade funcional com o Java (SDK de referência) — mesmos nomes de conceito de negócio,
mesmos defaults, mesma política de retry/idempotência/timeout, diferindo só no idioma da linguagem
(`client.withdrawals.quote(...)` vs. Java `client.withdrawals().quote(...)`).
