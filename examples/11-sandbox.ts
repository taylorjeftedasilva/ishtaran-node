// 11 -- Full Sandbox flow: credits test balance via the Faucet and confirms it. Never works
// against real Production (the backend rejects simulations outside a Sandbox-type Environment).
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Sandbox });

const environmentId = process.env.ISHTARAN_SANDBOX_ENVIRONMENT_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const observedAddress = await client.sandbox.faucet(environmentId, 'TDepositAddressReal', assetNetworkId, '100');
console.log('sandboxObservedAddressId=', observedAddress.sandboxObservedAddressId);

// Simulated confirmation -- the real Deposit will be processed via the Outbox (asynchronous).
await client.sandbox.simulateConfirmation(environmentId, observedAddress.sandboxObservedAddressId, 3, true);
console.log('Confirmation simulated -- the real Deposit will be processed via the Outbox (asynchronously).');

const treasuryBalance = await client.sandbox.getTreasuryBalance(environmentId, assetNetworkId);
console.log('Observed Treasury:', treasuryBalance.balance);
