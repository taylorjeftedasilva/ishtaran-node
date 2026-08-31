// 07 -- Quote a withdrawal BEFORE committing the amount (pure read, never reserves balance).
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;
const environmentId = process.env.ISHTARAN_ENVIRONMENT_ID!;
const accountId = process.env.ISHTARAN_PAYER_ACCOUNT_ID!;
const destinationId = process.env.ISHTARAN_WITHDRAWAL_DESTINATION_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const quote = await client.withdrawals.quote(organizationId, environmentId, accountId, destinationId, assetNetworkId, '50');
console.log('requestedAmount=', quote.requestedAmount);
// Under SelfCustody the beneficiary always receives the full requestedAmount -- estimatedNetworkFee
// is deprecated and always null. networkExecutionCost is the real network cost (paid separately,
// per the registered NetworkCostPayerAccount, never subtracted from what the beneficiary receives).
console.log('estimatedRecipientAmount=', quote.estimatedRecipientAmount);
console.log('networkExecutionCost=', quote.networkExecutionCost);
console.log('expiresAt=', quote.expiresAt);
