// 01 — Quickstart mínimo: API key -> client -> primeira chamada útil.
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({
  apiKey: process.env.ISHTARAN_API_KEY,
  environment: Environment.Local,
});

console.log(`Client Ishtaran pronto: ${client.accounts.constructor.name} disponível.`);
