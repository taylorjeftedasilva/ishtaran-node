// 02 -- Create an Account and fetch it back (Core API).
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });
const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;

const created = await client.accounts.create(organizationId, 'customer-example-002');
console.log('Account created:', created.accountId);

const account = await client.accounts.get(created.accountId);
console.log('Status:', account.status, 'accountHolderId=', account.accountHolderId);

// DEC-032 -- an Account no longer carries externalId/organizationId directly (global identity,
// linked to N Organizations via Relationship). To see this Organization's link to the Account
// (including externalId/authorized Applications), query the Organization-scoped list:
const relationships = await client.accounts.list(organizationId);
const own = relationships.find((r) => r.accountId === created.accountId)!;
console.log('Relationship:', own.relationshipId, 'externalId=', own.externalId, 'status=', own.relationshipStatus);
