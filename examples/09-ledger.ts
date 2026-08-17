// 09 — Consultar saldo e histórico de Ledger Entries (com paginação real via async generator lazy).
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const accountId = process.env.ISHTARAN_PAYER_ACCOUNT_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const balance = await client.getBalance(accountId, assetNetworkId);
console.log(`Available=${balance.available} Pending=${balance.pending} Reserved=${balance.reserved}`);

console.log('Últimas entradas do Ledger:');
let count = 0;
for await (const entry of client.ledger.listAllEntries(accountId, assetNetworkId, {}, 20)) {
  console.log(`  ${entry.nature.name} ${entry.amount} (${entry.originReference})`);
  if (++count >= 50) {
    break; // iterador é lazy -- nunca carrega tudo de uma vez, seguro interromper cedo
  }
}
