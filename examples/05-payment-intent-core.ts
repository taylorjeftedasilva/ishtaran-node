// 05 -- Create a Payment Intent via the Core API. The real depositAddress only appears on the dedicated GET.
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;
const transactionId = process.env.ISHTARAN_TRANSACTION_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const created = await client.deposits.createPaymentIntent(organizationId, transactionId, assetNetworkId, '250', undefined);
const full = await client.deposits.getPaymentIntent(created.paymentIntentId);
console.log('depositAddress=', full.depositAddress);
console.log('status=', full.status.name);
