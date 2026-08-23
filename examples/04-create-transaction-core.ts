// 04 -- Create a Transaction via the Core API, with granular control over participants.
import { IshtaranClient, Environment, ParticipantInput } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;
const applicationId = process.env.ISHTARAN_APPLICATION_ID!;
const payerAccountId = process.env.ISHTARAN_PAYER_ACCOUNT_ID!;
const recipientAccountId = process.env.ISHTARAN_RECIPIENT_ACCOUNT_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const participants: ParticipantInput[] = [
  { accountId: payerAccountId, role: 'payer', isPayer: true },
  { accountId: recipientAccountId, role: 'recipient', isPayer: false },
];

const created = await client.transactions.create(organizationId, applicationId, null, assetNetworkId, '250', participants);
console.log('transactionId=', created.transactionId);

const state = await client.transactions.getState(created.transactionId);
console.log('Status:', state.status.name);
