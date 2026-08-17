// 10 — Verificação de assinatura de webhook. Único exemplo 100% executável sem uma API real
// rodando (cálculo local, sem chamada HTTP) — simula uma entrega real da plataforma.
import { IshtaranClient, Environment, computeWebhookSignature } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: 'example-key-not-a-real-network-call', environment: Environment.Local });

const endpointSecret = 'whsec_example_secret_do_not_use_in_production';
const rawBody = '{"eventType":"payment.received","amount":100}';
const timestamp = Math.floor(Date.now() / 1000);

// Do lado da plataforma: assinatura calculada e enviada nos headers X-Webhook-Signature/
// X-Webhook-Timestamp junto com o rawBody como corpo da entrega HTTP real.
const signature = computeWebhookSignature(timestamp, rawBody, endpointSecret);
console.log('Assinatura calculada (simulando a plataforma):', signature);

// Do lado do integrador: verificação real usando o SDK, sem chamada de rede.
const valid = client.verifyWebhookSignature(rawBody, signature, String(timestamp), endpointSecret);
console.log('Assinatura válida?', valid);

// Payload adulterado depois do envio -- a verificação deve rejeitar.
const tamperedBody = '{"eventType":"payment.received","amount":999999}';
const tamperedValid = client.verifyWebhookSignature(tamperedBody, signature, String(timestamp), endpointSecret);
console.log('Payload adulterado ainda válido?', tamperedValid, '(esperado: false)');
