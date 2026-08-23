// 10 -- Webhook signature verification. The only example 100% runnable without a real API
// running (local computation, no HTTP call) -- simulates a real delivery from the platform.
import { IshtaranClient, Environment, computeWebhookSignature } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: 'example-key-not-a-real-network-call', environment: Environment.Local });

const endpointSecret = 'whsec_example_secret_do_not_use_in_production';
const rawBody = '{"eventType":"payment.received","amount":100}';
const timestamp = Math.floor(Date.now() / 1000);

// Platform side: the signature is computed and sent in the X-Webhook-Signature/
// X-Webhook-Timestamp headers along with rawBody as the real HTTP delivery's body.
const signature = computeWebhookSignature(timestamp, rawBody, endpointSecret);
console.log('Computed signature (simulating the platform):', signature);

// Integrator side: real verification using the SDK, no network call.
const valid = client.verifyWebhookSignature(rawBody, signature, String(timestamp), endpointSecret);
console.log('Signature valid?', valid);

// Payload tampered with after sending -- verification must reject it.
const tamperedBody = '{"eventType":"payment.received","amount":999999}';
const tamperedValid = client.verifyWebhookSignature(tamperedBody, signature, String(timestamp), endpointSecret);
console.log('Tampered payload still valid?', tamperedValid, '(expected: false)');
