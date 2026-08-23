// 09 -- Query balance and Ledger Entry history (with real pagination via a lazy async generator).
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });

const accountId = process.env.ISHTARAN_PAYER_ACCOUNT_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

const balance = await client.getBalance(accountId, assetNetworkId);
console.log(`Available=${balance.available} Pending=${balance.pending} Reserved=${balance.reserved}`);

console.log('Latest Ledger entries:');
let count = 0;
for await (const entry of client.ledger.listAllEntries(accountId, assetNetworkId, {}, 20)) {
  console.log(`  ${entry.nature.name} ${entry.amount} (${entry.originReference})`);
  if (++count >= 50) {
    break; // the iterator is lazy -- never loads everything at once, safe to break early
  }
}
