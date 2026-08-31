// 14 -- End-to-end marketplace journey, re-verified live 2026-08-31 against the Network Execution
// Engine: a buyer pays into a marketplace that holds its own self-custody execution wallet, a
// seller signs up as their own AccountHolder to receive the payout, and the marketplace signs the
// real payout itself -- Ishtaran never sees a private key. Closes the full cycle other examples
// cover individually (self-service signup, self-custody signing, Payment Intents, AccountHolder
// invitations): this one connects them into one story, the way a real integrator would use them.
//
// Real gaps found and fixed while building/re-validating this example, not hypothetical:
//   - accounts.authorizeApplication requires a Member session -- it always rejects an API Key,
//     even though Accounts is otherwise usable with either (see AccountsEndpoints.cs,
//     MemberPermissionPolicy.Require).
//   - Once a Payment Intent's deposit is confirmed, the Transaction moves itself to Reserved --
//     no explicit transactions.reserve(...) call is needed (or valid) in this path.
//   - executeSettlement() now builds its OWN SigningRequest automatically (confirmed live
//     2026-08-31) -- an earlier version of this example manually called signingRequests.create()
//     with hand-picked destination addresses right after executeSettlement(), which built a
//     second, unrelated SigningRequest disconnected from the real Settlement. That is now wrong:
//     sign the SigningRequest executeSettlement() itself returns (settlement.signingRequestId).
//   - Under SelfCustody, broadcasting a beneficiary's leg costs real network resources, charged
//     separately from the Platform Fee -- a NetworkCostPayerAccount must be registered once per
//     (organizationId, assetNetworkId) before the first real Settlement, or executeSettlement()
//     fails with 422 PAYOUT_BATCH_NETWORK_COST_PAYER_ACCOUNT_NOT_REGISTERED. This example
//     registers the marketplace's own commission Account as the payer -- a real business
//     decision, not a technical afterthought.
//   - Each beneficiary paid under SelfCustody (the seller, and the platform's own commission)
//     needs a registered ExecutionDestination -- the real on-chain address that beneficiary
//     actually receives funds at -- before executeSettlement() can build a leg for them.
//
// Requires only ISHTARAN_ASSET_NETWORK_ID/ISHTARAN_NETWORK_ID env vars (an Asset Network already
// seeded in the target Sandbox) -- everything else (Organization, Application, Environment, API
// Key, both Accounts) is provisioned by the example itself.
import { IshtaranClient, Environment, DerivationScheme, TransactionStatus, wallet, deriveTronAddress } from '@ishtaran/sdk';

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
//    reaches Ishtaran. This is the wallet that will sign the real payout in step 10, and that
//    allocates the marketplace's own commission address in step 6.
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
//    one-off payer). The marketplace's own commission Account, same shape.
const buyerAccountId = (await client.accounts.create(organizationId, `buyer-${t}`)).accountId;
const marketplaceRevenueAccountId = (await client.accounts.create(organizationId, `marketplace-revenue-${t}`)).accountId;
console.log('[4] buyer accountId=', buyerAccountId, 'marketplaceRevenueAccountId=', marketplaceRevenueAccountId);

// 5. Authorize all three Accounts for this Application. GOTCHA: this call requires the Member
//    client (`owner`), not the API Key client (`client`) -- see file header.
await owner.accounts.authorizeApplication(organizationId, sellerAccountId, applicationId);
await owner.accounts.authorizeApplication(organizationId, buyerAccountId, applicationId);
await owner.accounts.authorizeApplication(organizationId, marketplaceRevenueAccountId, applicationId);
console.log('[5] all three accounts authorized for the application');

// 6. Register where each SelfCustody beneficiary actually gets paid, and who pays for network
//    execution. The seller's destination is their OWN external wallet (a throwaway wallet here
//    stands in for "whatever wallet the seller really uses" -- Ishtaran never touches its key).
//    The marketplace's own commission lands on an address of its OWN execution wallet -- and that
//    same commission Account is the one registered to pay real network cost, out of its own
//    commission, a real business decision.
const sellerWallet = wallet.generate();
const sellerDestinationAddress = deriveTronAddress(sellerWallet.wallet.accountExtendedPublicKey, 0);
await client.executionDestinations.register(organizationId, sellerAccountId, assetNetworkId, sellerDestinationAddress);
const marketplaceRevenueAllocation = await client.wallets.allocateDepositAddress(applicationId, networkId);
await client.executionDestinations.register(organizationId, marketplaceRevenueAccountId, assetNetworkId, marketplaceRevenueAllocation.address);
await client.networkCostPayerAccounts.register(organizationId, assetNetworkId, marketplaceRevenueAccountId);
console.log('[6] ExecutionDestinations + NetworkCostPayerAccount registered');

// 7. Transaction + Payment Intent. An explicit Split is required here (2 non-payer Participants
//    -- seller and marketplace -- BR-SPL-004/BR-SPL-003: a single implicit 100% only applies with
//    exactly one beneficiary).
const payer = { accountId: buyerAccountId, role: 'payer', isPayer: true };
const seller = { accountId: sellerAccountId, role: 'seller', isPayer: false, splitPercentage: '90' };
const marketplace = { accountId: marketplaceRevenueAccountId, role: 'marketplace', isPayer: false, splitPercentage: '10' };
const txn = await client.transactions.create(organizationId, applicationId, environmentId, null, assetNetworkId, '1000', [payer, seller, marketplace], `marketplace-txn-${t}`);
const intent = await client.deposits.createPaymentIntent(organizationId, txn.transactionId, assetNetworkId, '1000', undefined);
const fullIntent = await client.deposits.getPaymentIntent(intent.paymentIntentId);
console.log('[7] paymentIntentId=', intent.paymentIntentId, 'depositAddress=', fullIntent.depositAddress);

// 8. Simulate the buyer's on-chain deposit and its confirmation (Sandbox only). Once confirmed,
//    the Transaction moves itself to Reserved -- no explicit reserve() call.
const observed = await client.sandbox.simulateDeposit(environmentId, fullIntent.depositAddress!, assetNetworkId, '1000');
await client.sandbox.simulateConfirmation(environmentId, observed.sandboxObservedAddressId, 1, true);
let status = TransactionStatus.CREATED;
for (let i = 0; i < 20; i++) {
  if (status !== TransactionStatus.CREATED && status !== TransactionStatus.AWAITING_FUNDS) break;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  status = (await client.transactions.getState(txn.transactionId)).status;
}
console.log('[8] deposit confirmed, transaction status=', status.name);

// 9. Settlement -- calculates the Platform Fee/Split AND builds a real SigningRequest itself
//    (SelfCustody, confirmed live): one ExecutionLeg per beneficiary (seller, marketplace
//    commission), each addressed via the ExecutionDestination registered in step 6. Nothing is
//    final yet -- signingRequestId is populated, but no Ledger Entry exists until every leg
//    confirms (step 10-11).
const executed = await client.settlements.executeSettlement(txn.transactionId);
const settlement = await client.settlements.get(executed.settlementId);
console.log('[9] settlement executed id=', settlement.settlementId, 'signingRequestId=', settlement.signingRequestId);

// 10. Sign every leg of THAT SAME SigningRequest, locally, with the marketplace's own execution
//     wallet -- the private key is used here and only here, never sent anywhere. A Settlement
//     with nothing to execute on-chain (every allocation Retained, Fee zero) has
//     signingRequestId=null; this example's Split always produces real legs to sign.
if (!settlement.signingRequestId) throw new Error('Expected a real SigningRequest for this Settlement');
const signingRequestId = settlement.signingRequestId;
const signingRequest = await client.signingRequests.get(signingRequestId);
for (const leg of signingRequest.legs) {
  const hashBytes = hexToBytes(leg.canonicalHash);
  const signature = generatedWallet.signer.sign(signingRequest.derivationReference, hashBytes);
  const result = await client.signingRequests.submitSignedTransaction(
    signingRequestId, leg.executionLegId, leg.canonicalHash, bytesToHex(signature),
  );
  // allLegsVerified only flips to true on the LAST leg submitted -- the all-signatures gate
  // never broadcasts on a partial set of signatures. It broadcasts automatically at that point --
  // no separate "broadcast" call exists.
  console.log(`[10] leg=${leg.role} verified=${result.verified} allLegsVerified=${result.allLegsVerified}`);
}

// 11. Simulate each leg's on-chain confirmation (Sandbox only) and wait for the Settlement to
//     reach Completed -- only then does the Ledger reflect anything (Delivered, never Available,
//     since both beneficiaries' ExecutionDestinations are external wallets -- see
//     concepts/self-custody and concepts/transactions-settlements on the docs site).
for (let i = 0; i < 20; i++) {
  const current = await client.signingRequests.get(signingRequestId);
  const allReferenced = current.legs.every((leg) => leg.broadcastReference);
  if (allReferenced) {
    for (const leg of current.legs) {
      const broadcastAttemptId = sandboxBroadcastAttemptIdFromReference(leg.broadcastReference!);
      await client.sandbox.simulateBroadcastConfirmation(environmentId, broadcastAttemptId, 1, true);
    }
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

let finalSettlement = await client.settlements.get(settlement.settlementId);
for (let i = 0; i < 30 && finalSettlement.status.name !== 'COMPLETED'; i++) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  finalSettlement = await client.settlements.get(settlement.settlementId);
}
console.log('[11] settlement status=', finalSettlement.status.name);

const sellerPayable = await client.payout.getPayableSummary(sellerAccountId, assetNetworkId);
const marketplacePayable = await client.payout.getPayableSummary(marketplaceRevenueAccountId, assetNetworkId);
console.log('[11] seller paid=', sellerPayable.paid, 'marketplace paid=', marketplacePayable.paid);

function sandboxBroadcastAttemptIdFromReference(reference: string): string {
  const prefix = 'sandbox-broadcast-';
  if (!reference.startsWith(prefix)) throw new Error(`Unexpected broadcastReference format: ${reference}`);
  const hexN = reference.slice(prefix.length);
  return `${hexN.slice(0, 8)}-${hexN.slice(8, 12)}-${hexN.slice(12, 16)}-${hexN.slice(16, 20)}-${hexN.slice(20, 32)}`;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
