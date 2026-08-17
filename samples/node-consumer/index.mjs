// Prova de consumo real do tarball @ishtaran/sdk gerado via `npm pack` — "package dry run" exigido
// pelo brief do SDK Program (nunca publicação real, só instalação local do tarball + consumo).
import { IshtaranClient, Environment, verifyWebhookSignature } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: 'test-key', environment: Environment.Local });

if (!client.withdrawals || !client.accounts || !client.auth || !client.ledger) {
  throw new Error('Client mal construído');
}

const valid = verifyWebhookSignature('{}', 'deadbeef', String(Math.floor(Date.now() / 1000)), 'secret');
if (valid) {
  throw new Error('Assinatura inválida não deveria verificar');
}

console.log('NODE_CONSUMER_SMOKE_TEST: OK — @ishtaran/sdk consumido com sucesso via npm pack (tarball local).');
