// 03 -- Receive a payment via Easy Mode: composes Transaction + Payment Intent, returns the
// real depositAddress with the real Core IDs for debugging.
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;
const applicationId = process.env.ISHTARAN_APPLICATION_ID!;
const environmentId = process.env.ISHTARAN_ENVIRONMENT_ID!;
const payerAccountId = process.env.ISHTARAN_PAYER_ACCOUNT_ID!;
const recipientAccountId = process.env.ISHTARAN_RECIPIENT_ACCOUNT_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const payment = await client.receivePayment(organizationId, applicationId, environmentId, payerAccountId, recipientAccountId, assetNetworkId, '100');
console.log('transactionId=', payment.transactionId);
console.log('paymentIntentId=', payment.paymentIntentId);
console.log('depositAddress=', payment.depositAddress);

const finished = await client.waitForPayment(payment.transactionId, payment.paymentIntentId, 10 * 60_000, 5_000);
console.log('Final status:', finished.paymentIntentStatus.name);
