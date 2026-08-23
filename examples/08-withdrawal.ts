// 08 -- Execute a withdrawal via Easy Mode and wait (with timeout) until a terminal state.
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;
const accountId = process.env.ISHTARAN_PAYER_ACCOUNT_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const withdrawal = await client.withdraw(organizationId, accountId, assetNetworkId, '50', 'TDestinationAddressReal', undefined);
console.log('withdrawalId=', withdrawal.withdrawalId);
console.log(`You receive ${withdrawal.estimatedRecipientAmount} (network fee: ${withdrawal.estimatedNetworkFee})`);

const finalState = await client.withdrawals.waitFor(withdrawal.withdrawalId, 15 * 60_000, 10_000);
console.log('Final status:', finalState.status.name);
