// 07 — Cotar um saque ANTES de comprometer o valor (leitura pura, nunca reserva saldo).
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;
const accountId = process.env.ISHTARAN_PAYER_ACCOUNT_ID!;
const destinationId = process.env.ISHTARAN_WITHDRAWAL_DESTINATION_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const quote = await client.withdrawals.quote(organizationId, accountId, destinationId, assetNetworkId, '50');
console.log('requestedAmount=', quote.requestedAmount);
console.log('estimatedNetworkFee=', quote.estimatedNetworkFee);
console.log('estimatedRecipientAmount=', quote.estimatedRecipientAmount);
console.log('expiresAt=', quote.expiresAt);
