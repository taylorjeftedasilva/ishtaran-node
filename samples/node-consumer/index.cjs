// Prova de que o formato CJS também funciona (dual ESM+CJS via tsup), não só ESM.
const { IshtaranClient, Environment } = require('@ishtaran/sdk');

const client = IshtaranClient.create({ apiKey: 'test-key', environment: Environment.Local });
if (!client.accounts) {
  throw new Error('Client mal construído (CJS)');
}
console.log('NODE_CONSUMER_CJS_SMOKE_TEST: OK — @ishtaran/sdk consumido via require() (CJS).');
