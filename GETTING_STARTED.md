# Getting Started

## 1. Install the dependency

```bash
npm install @ishtaran/sdk   # once published; for now, see README.md for local consumption via tarball
```

## 2. Build the client

```typescript
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({
  apiKey: process.env.ISHTARAN_API_KEY,
  environment: Environment.Local,
});
```

`Environment.Sandbox`/`Production` don't have a known real URL yet — use an explicit `baseUrl`
(see [`CONFIGURATION.md`](CONFIGURATION.md)).

## 3. Check a balance (Easy Mode)

```typescript
const balance = await client.getBalance(accountId, assetNetworkId);
console.log('Available:', balance.available); // string
```

## 4. Receive a payment (Easy Mode)

```typescript
const payment = await client.receivePayment(organizationId, applicationId, payerAccountId, recipientAccountId, assetNetworkId, '100');
console.log('Deposit address:', payment.depositAddress);

const finished = await client.waitForPayment(payment.transactionId, payment.paymentIntentId, 10 * 60_000, 5_000);
```

## 5. Withdrawal with visible Network Fee (Easy Mode)

```typescript
const withdrawal = await client.withdraw(organizationId, accountId, assetNetworkId, '50', 'TDestinationAddressReal', undefined);
console.log(`You receive ${withdrawal.estimatedRecipientAmount} (fee: ${withdrawal.estimatedNetworkFee})`);
```

## 6. Or use Core directly

```typescript
const account = await client.accounts.get(accountId);
const quote = await client.withdrawals.quote(organizationId, accountId, destinationId, assetNetworkId, '50');
```

## Next steps

- [`AUTHENTICATION.md`](AUTHENTICATION.md), [`EASY_MODE.md`](EASY_MODE.md), [`ERROR_HANDLING.md`](ERROR_HANDLING.md)
- [`examples/`](examples/) — 11 numbered examples
