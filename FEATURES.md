# Features

Derived from the real API contract (see the [API Reference](https://ishtaran.com/docs/api/ishtaran-api)). Core API: 100/100 real
operations (16/16 modules). Easy Mode: 100% (`payments.*`, `withdraw`, `getBalance`,
`verifyWebhookSignature`). Cross-cutting: 100% (config, auth, errors, retry, idempotency,
pagination, forward-compatible enums, security/redaction, opt-in logging, safe waitFor,
validated ESM+CJS packaging).

100% functional parity with the Java SDK (reference implementation) — same business-concept
names, same defaults, same retry/idempotency/timeout policy, differing only in the language's
idiom (`client.withdrawals.quote(...)` vs. Java `client.withdrawals().quote(...)`).
