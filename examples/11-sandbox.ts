// 11 -- Full Sandbox flow: simulate a Deposit confirmation and a withdrawal broadcast.
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const applicationId = process.env.ISHTARAN_APPLICATION_ID!;
const networkId = process.env.ISHTARAN_NETWORK_ID!;
const walletId = process.env.ISHTARAN_WALLET_ID!;
const derivationReference = process.env.ISHTARAN_DERIVATION_REFERENCE!;

const allocated = await client.wallets.allocateDepositAddress(applicationId, networkId);
console.log('address=', allocated.address, 'derivationReference=', allocated.derivationReference);

// Simulated confirmation -- the real Deposit will be processed via the Outbox (asynchronous).
const confirmation = await client.sandbox.simulateDepositConfirmation(networkId, allocated.derivationReference, '100.00');
console.log('Simulated confirmation:', confirmation.transactionHash);

const broadcast = await client.sandbox.simulateWithdrawalBroadcast(walletId, derivationReference);
console.log('Simulated broadcast:', broadcast.broadcastReference);
