# SECURITY_REVIEW.md — Ishtaran TypeScript/Node.js SDK

Checklist from §57 of the SDK Program brief. Same discipline as Java: every item backed by real
evidence (test or code reading), never assumed.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Secrets never logged | ✅ PASS | `loggingTransport.test.ts` -- `redactedHeaders` never exposes API Key/Authorization in plain text |
| 2 | API Key never in URL/querystring | ✅ PASS | `AuthenticatingTransport` only attaches it via header; no resource builds a URL with the key |
| 3 | TLS verified by default | ✅ PASS | Node's native `fetch` verifies the certificate by default; no disable switch exposed by this SDK |
| 4 | Constant-time webhook signature comparison | ✅ PASS | Real `node:crypto.timingSafeEqual` (not `===`) -- `webhookSignatureVerifier.test.ts` (7 tests, including a vector computed independently via `node:crypto` directly and via Python/hmac in the Java version) |
| 5 | Safe retries (never blind on a non-idempotent mutation) | ✅ PASS | `retryingTransport.test.ts` -- never retries on 400/401/403/404/409/422; 5xx only with idempotency/GET |
| 6 | Mandatory timeout, never infinite | ✅ PASS | `AbortSignal.timeout(requestTimeoutMs)` always applied; finite defaults (`clientConfig.test.ts`) |
| 7 | Central redaction in opt-in logging | ✅ PASS | `LoggingTransport` never logs the raw body, only method/path/status/duration |
| 8 | Minimal, scanned dependencies | ✅ PASS | 1 production dependency (`lossless-json`, mature/popular). `npm audit` reports 0 vulnerabilities in the production tree; the 1 remaining `low` vulnerability is dev-only (`esbuild`, used only by the `tsup` bundler, never shipped in the published package) |
| 9 | Money never loses precision | ✅ PASS | `json.test.ts` -- `lossless-json` preserves the exact text of the number; explicit test confirming that native `JSON.parse` WOULD have lost that precision (proving the problem is real, not hypothetical) |
| 10 | Malicious/malformed response never crashes the client | ✅ PASS | `errorMapper.test.ts` -- a malformed body never throws a parsing error; unknown enums never throw (`enums.test.ts`) |
| 11 | Unbounded response body size | ⚠️ **REAL LIMITATION, NOT FIXED** | `fetch`/`response.text()` buffers the entire response in memory with no configurable limit in this version. Same limitation documented in the Java SDK -- see "Known limitations" |
| 12 | Safe deserialization | ✅ PASS | `lossless-json`/`JSON.parse` never do polymorphic/reflection-based deserialization -- they always produce plain structural data, manually mapped to known types |
| 13 | User-controlled URL / SSRF | ✅ PASS | `baseUrl` is always explicit and fixed at client construction -- no business method accepts a URL override (verified: no method in `resources/*.ts` takes a URL parameter) |
| 14 | HTTP redirect behavior | ✅ PASS (fixed in this review) | `FetchHttpTransport` uses `redirect: 'manual'` and treats any 3xx as a `NetworkError` -- never follows automatically, now with real parity with Java's `Redirect.NEVER`. See "Finding fixed" below |
| 15 | Header injection | ✅ PASS | Native `fetch` validates header names/values (rejects CR/LF) -- never built via raw string concatenation |
| 16 | Query string injection | ✅ PASS | Every free-form (non-enum) query string value goes through `URLSearchParams`, which URL-encodes automatically -- `webhookEndpointsResource.test.ts` confirms an `eventType` with embedded `&`/`=` never injects an extra parameter. **Better posture than Java in this version** (Java needed a manual fix for the same case; TypeScript uses `URLSearchParams` from the start, closing this risk class by construction) |
| 17 | Proxy behavior | N/A | Not applicable -- no custom proxy configuration exposed; `fetch` uses the runtime's default behavior |

## Finding fixed during this review

**Native `fetch` would follow HTTP redirects automatically by default** (`redirect: 'follow'` is
the WHATWG fetch default) -- unlike the Java SDK's `java.net.http.HttpClient`, which defaults to
`Redirect.NEVER`. A malicious 3xx redirect coming from a compromised `baseUrl` would have been
followed automatically. Fixed in this session: `FetchHttpTransport` now uses
`redirect: 'manual'` and treats any 3xx as a `NetworkError`, restoring real parity with Java.
Covered by `fetchTransport.test.ts` (a mocked `fetch` confirming `redirect: 'manual'` is passed
and that a 302 throws `NetworkError`).

## Known limitations (documented, never hidden)

1. **Unbounded response body size** (item 11) -- same limitation as the Java SDK, same
   justification (the risk only exists if `baseUrl` points to a compromised host).
2. **`connectTimeoutMs` not enforced separately** from `requestTimeoutMs` (see `CONFIGURATION.md`)
   -- not a security item per se, but it affects behavioral parity under a slow network/DoS via
   a hung connection.

## Verdict

**PASS**, with 2 explicitly documented limitations (never hidden) -- no critical or
high-severity finding remains unfixed or unjustified; the one real behavioral finding
(redirects followed automatically) was fixed, not just noted.
