// 06 — Liquidar uma Transaction financiada (Settlement) e consultar o resumo.
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });
const transactionId = process.env.ISHTARAN_TRANSACTION_ID!;

const result = await client.settlements.executeSettlement(transactionId);
console.log('settlementId=', result.settlementId);

const settlement = await client.settlements.get(result.settlementId);
console.log(`grossAmount=${settlement.grossAmount}, platformFeeAmount=${settlement.platformFeeAmount}, distributableAmount=${settlement.distributableAmount}`);

const summary = await client.settlements.getSummary(transactionId);
console.log(`settledAmount=${summary.settledAmount}, retainedAmount=${summary.retainedAmount}`);
