// 11 — Fluxo completo de Sandbox: credita saldo de teste via Faucet e confirma. Nunca funciona
// contra Production real (o backend rejeita simulações fora de um Environment do tipo Sandbox).
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const environmentId = process.env.ISHTARAN_SANDBOX_ENVIRONMENT_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const observedAddress = await client.sandbox.faucet(environmentId, 'TDepositAddressReal', assetNetworkId, '100');
console.log('sandboxObservedAddressId=', observedAddress.sandboxObservedAddressId);

await client.sandbox.simulateConfirmation(environmentId, observedAddress.sandboxObservedAddressId, 3, true);
console.log('Confirmação simulada — o Deposit real será processado via Outbox (assíncrono).');

const treasuryBalance = await client.sandbox.getTreasuryBalance(environmentId, assetNetworkId);
console.log('Treasury observada:', treasuryBalance.balance);
