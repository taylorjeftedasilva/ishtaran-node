// 14 -- End-to-end marketplace journey, verified live against the real Sandbox (2026-08-25): a
// buyer pays into a marketplace that holds its own self-custody execution wallet, a seller signs
// up as their own AccountHolder to receive the payout, and the marketplace signs the real payout
// itself -- Ishtaran never sees a private key. Closes the full cycle other examples cover
// individually (self-service signup, self-custody signing, Payment Intents, AccountHolder
// invitations): this one connects them into one story, the way a real integrator would use them.
//
// Two real gaps found and fixed while building this example, not hypothetical:
//   - accounts.authorizeApplication requires a Member session -- it always rejects an API Key,
//     even though Accounts is otherwise usable with either (see AccountsEndpoints.cs,
//     MemberPermissionPolicy.Require).
//   - Once a Payment Intent's deposit is confirmed, the Transaction moves itself to Reserved --
//     no explicit transactions.reserve(...) call is needed (or valid) in this path.
//
// Requires only ISHTARAN_ASSET_NETWORK_ID/ISHTARAN_NETWORK_ID env vars (an Asset Network already
// seeded in the target Sandbox) -- everything else (Organization, Application, Environment, API
// Key, both Accounts) is provisioned by the example itself.
import { IshtaranClient, Environment, DerivationScheme, TransactionStatus, wallet } from '@ishtaran/sdk';

const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;
const networkId = process.env.ISHTARAN_NETWORK_ID!;
const t = Date.now();

// 1. Marketplace operator signs up -- one call provisions Organization, a default Application,
//    its Sandbox Environment, and a first API Key.
const owner = IshtaranClient.create({ environment: Environment.Sandbox });
const signup = await owner.auth.signUp(`Marketplace Demo ${t}`, `owner+${t}@example.com`, 'Str0ngP@ssw0rd!123');
const { organizationId, applicationId, environmentId } = signup;
console.log('[1] signup ok organizationId=', organizationId);

const client = IshtaranClient.create({ apiKey: signup.apiKeyPlainText!, environment: Environment.Sandbox });

// 2. The marketplace's own execution wallet -- generated locally, only the public key ever
//    reaches Ishtaran. This is the wallet that will sign the real payout in step 9.
const generatedWallet = wallet.generate();
const registeredWallet = await client.wallets.register(
  applicationId, networkId, DerivationScheme.TRON_BIP44_HARDENED_ACCOUNT,
  generatedWallet.wallet.accountExtendedPublicKey, `marketplace-wallet-${t}`,
);
console.log('[2] execution wallet registered walletId=', registeredWallet.walletId);

// 3. Seller signs up as their own AccountHolder, via an invitation the marketplace issues -- a
//    distinct session, never the marketplace acting on the seller's behalf.
const invitation = await client.accounts.createAccountHolderInvitation(organizationId, `seller-${t}`);
const sellerClient = IshtaranClient.create({ apiKey: signup.apiKeyPlainText!, environment: Environment.Sandbox });
const claim = await sellerClient.accountHolders.signUpAndClaimInvitation(
  invitation.plainTextToken, `seller+${t}@example.com`, 'SellerP@ss123!',
);
if (!claim.success) throw new Error(`Seller failed to claim invitation: ${claim.errorCode}`);
const sellerAccountId = (await sellerClient.accountHolders.me()).accountId;
console.log('[3] seller AccountHolder claimed, accountId=', sellerAccountId);

// 4. Buyer account -- Organization-provisioned, no login of their own (the common case for a
//    one-off payer).
const buyerAccountId = (await client.accounts.create(organizationId, `buyer-${t}`)).accountId;
console.log('[4] buyer accountId=', buyerAccountId);

// 5. Authorize both Accounts for this Application. GOTCHA: this call requires the Member client
//    (`owner`), not the API Key client (`client`) -- see file header.
await owner.accounts.authorizeApplication(organizationId, sellerAccountId, applicationId);
await owner.accounts.authorizeApplication(organizationId, buyerAccountId, applicationId);
console.log('[5] both accounts authorized for the application');

// 6. Transaction + Payment Intent. No Split declared -- with exactly one non-payer Participant,
//    BR-SPL-004 gives that Participant 100% of the Distributable Amount implicitly (2+ non-payer
//    Participants would require an explicit Split).
const payer = { accountId: buyerAccountId, role: 'payer', isPayer: true };
const seller = { accountId: sellerAccountId, role: 'seller', isPayer: false };
const txn = await client.transactions.create(organizationId, applicationId, null, assetNetworkId, '1000', [payer, seller], `marketplace-txn-${t}`);
const intent = await client.deposits.createPaymentIntent(organizationId, txn.transactionId, assetNetworkId, '1000', undefined);
const fullIntent = await client.deposits.getPaymentIntent(intent.paymentIntentId);
console.log('[6] paymentIntentId=', intent.paymentIntentId, 'depositAddress=', fullIntent.depositAddress);

// 7. Simulate the buyer's on-chain deposit and its confirmation (Sandbox only). Once confirmed,
//    the Transaction moves itself to Reserved -- no explicit reserve() call.
const observed = await client.sandbox.simulateDeposit(environmentId, fullIntent.depositAddress!, assetNetworkId, '1000');
await client.sandbox.simulateConfirmation(environmentId, observed.sandboxObservedAddressId, 1, true);
let status = TransactionStatus.CREATED;
for (let i = 0; i < 20; i++) {
  if (status !== TransactionStatus.CREATED && status !== TransactionStatus.AWAITING_FUNDS) break;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  status = (await client.transactions.getState(txn.transactionId)).status;
}
console.log('[7] deposit confirmed, transaction status=', status.name);

// 8. Settlement -- calculates the Platform Fee/Distributable split. It does not move funds by
//    itself; step 9 requests the real payout signature explicitly.
const settlement = await client.settlements.executeSettlement(txn.transactionId);
console.log('[8] settlement executed id=', settlement.settlementId);

// 9. The marketplace requests a SigningRequest for the real payout (seller's share, platform
//    fee) against its own execution wallet, and signs each leg's canonical hash LOCALLY -- the
//    private key is used here and only here, never sent anywhere.
const allocated = await client.wallets.allocateDepositAddress(applicationId, networkId);
const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const legs = [
  { role: 'Seller', destinationAddress: 'TSellerPayoutAddress0000000001', amount: '991' },
  { role: 'PlatformFee', destinationAddress: 'TIshtaranFeeAddress00000000001', amount: '9' },
];
const signingRequest = await client.signingRequests.create(
  environmentId, registeredWallet.walletId, allocated.derivationReference,
  `marketplace-settlement-${t}`, assetNetworkId, allocated.address, legs, expiresAt, `marketplace-sr-${t}`,
);

const fetchedSr = await client.signingRequests.get(signingRequest.signingRequestId);
for (const leg of fetchedSr.legs) {
  const hashBytes = hexToBytes(leg.canonicalHash);
  const signature = generatedWallet.signer.sign(allocated.derivationReference, hashBytes);
  const result = await client.signingRequests.submitSignedTransaction(
    signingRequest.signingRequestId, leg.executionLegId, leg.canonicalHash, bytesToHex(signature),
  );
  // allLegsVerified only flips to true on the LAST leg submitted -- the all-signatures gate
  // never broadcasts on a partial set of signatures.
  console.log(`[9] leg=${leg.role} verified=${result.verified} allLegsVerified=${result.allLegsVerified}`);
}

// 10. Confirm both legs broadcast -- the cycle is closed.
const finalSr = await client.signingRequests.get(signingRequest.signingRequestId);
for (const leg of finalSr.legs) {
  console.log(`[10] leg=${leg.role} status=${leg.status} broadcastReference=${leg.broadcastReference}`);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
