// 02 — Criar uma Account e consultá-la de volta (Core API).
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });
const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;

const created = await client.accounts.create(organizationId, 'customer-example-002');
console.log('Account criada:', created.accountId);

const account = await client.accounts.get(created.accountId);
console.log('Status:', account.status, 'externalId=', account.externalId);
