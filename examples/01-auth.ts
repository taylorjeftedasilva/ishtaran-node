// 01 -- Minimal quickstart: API key -> client -> first useful call.
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({
  apiKey: process.env.ISHTARAN_API_KEY,
  environment: Environment.Local,
});

console.log(`Ishtaran client ready: ${client.accounts.constructor.name} available.`);
