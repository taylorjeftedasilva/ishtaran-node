# Security

See `SECURITY_REVIEW.md` for the full formal checklist.

## Secrets never leak

`apiKey`/`endpointSecret`/tokens never appear in logs, exceptions, or serialization.
`describeConfig()` masks the API Key. Opt-in logging never logs
`Authorization`/`X-Api-Key` in plain text nor the raw body.

## TLS

Verified by default (native `fetch` behavior), with no disable switch exposed by this SDK.

## Webhook

`node:crypto.timingSafeEqual` (real constant time), validates the timestamp against replay,
never logs the secret.

## Dependencies

Minimal: `lossless-json` (the only production dependency — money precision, see
`SDK_CAPABILITY_SPEC.md` §11.1). Native `node:crypto`/`node:fetch`, zero third-party
dependency for transport/HMAC.
