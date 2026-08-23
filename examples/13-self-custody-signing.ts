// 13 -- Self-custody wallet/signing end to end (SPEC-017-021, checkpoint 9): generates the
// wallet LOCALLY (`wallet.generate()`), registers only the public key, allocates a real deposit
// address, creates a 2-leg SigningRequest, signs each canonical hash returned by the API with
// the private key (which NEVER leaves this process -- INV-SC-01), and submits it back. Proves
// the all-signatures gate (brief §11): `allLegsVerified` only becomes `true` after the second
// signature, and both Legs only become `Broadcast` at that same instant.
import { IshtaranClient, Environment, DerivationScheme, wallet, deriveTronAddress } from '@ishtaran/sdk';

const client = IshtaranClient.create({
  apiKey: process.env.ISHTARAN_API_KEY,
  environment: Environment.Local,
  baseUrl: process.env.ISHTARAN_BASE_URL ?? 'http://localhost:8080',
});

const applicationId = process.env.ISHTARAN_APPLICATION_ID!;
const environmentId = process.env.ISHTARAN_SANDBOX_ENVIRONMENT_ID!;
const networkId = process.env.ISHTARAN_NETWORK_ID!;
const assetNetworkId = process.env.ISHTARAN_ASSET_NETWORK_ID!;

// 1. Wallet generated locally -- the mnemonic/private key never leave this process.
const generated = wallet.generate();
console.log('mnemonic (backup -- NEVER sent to the API):', generated.mnemonic);
console.log('accountExtendedPublicKey (only this goes to the API):', generated.wallet.accountExtendedPublicKey);

// 2. Register the wallet -- the API only ever receives the public key.
const registered = await client.wallets.register(
  applicationId,
  networkId,
  DerivationScheme.TRON_BIP44_HARDENED_ACCOUNT,
  generated.wallet.accountExtendedPublicKey,
  `example13-wallet-${crypto.randomUUID()}`,
);
console.log('walletId=', registered.walletId);

// 3. GetWallet never includes the material (BR-WLT-002).
const fetchedWallet = await client.wallets.get(registered.walletId);
console.log('wallet.scheme=', fetchedWallet.scheme.name, 'nextDerivationIndex=', fetchedWallet.nextDerivationIndex);

// 4. Allocate a real deposit address -- derived from the registered xpub.
const allocated = await client.wallets.allocateDepositAddress(applicationId, networkId);
console.log('sourceAddress=', allocated.address, 'derivationReference=', allocated.derivationReference);

// Local, backend-independent confirmation (defense in depth -- same algorithm as TronAddress).
const locallyDerivedAddress = deriveTronAddress(generated.wallet.accountExtendedPublicKey, allocated.derivationReference);
if (locallyDerivedAddress !== allocated.address) {
  throw new Error(`Address mismatch: backend=${allocated.address} local=${locallyDerivedAddress}`);
}

// 5. Create the SigningRequest -- 2 legs (Seller + Ishtaran Platform Fee), amounts already
//    computed by the caller (real Settlement/Withdrawals integration is future work). expiresAt
//    is always explicit UTC (`Date.toISOString()` is always UTC in JS -- never depends on the
//    process's local timezone).
const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const created = await client.signingRequests.create(
  environmentId,
  registered.walletId,
  allocated.derivationReference,
  `example13-settlement-${crypto.randomUUID()}`,
  assetNetworkId,
  allocated.address,
  [
    { role: 'Seller', destinationAddress: 'TSellerDestinationAddress123456', amount: '90' },
    { role: 'PlatformFee', destinationAddress: 'TIshtaranFeeDestinationAddr123', amount: '1' },
  ],
  expiresAt,
  `example13-signing-request-${crypto.randomUUID()}`,
);
console.log('signingRequestId=', created.signingRequestId);

// 6. Fetch the SigningRequest -- each Leg already carries the canonicalHash computed by the backend.
const signingRequest = await client.signingRequests.get(created.signingRequestId);

// 7. Sign each hash locally and submit -- never in parallel, so the all-signatures gate can be
//    observed: the first submission must never trigger a broadcast on its own.
for (const leg of signingRequest.legs) {
  const canonicalHashBytes = hexToBytes(leg.canonicalHash);
  const signature = generated.signer.sign(allocated.derivationReference, canonicalHashBytes);
  const signatureHex = bytesToHex(signature);

  const result = await client.signingRequests.submitSignedTransaction(
    created.signingRequestId,
    leg.executionLegId,
    leg.canonicalHash,
    signatureHex,
  );

  console.log(`leg=${leg.role} verified=${result.verified} allLegsVerified=${result.allLegsVerified} mismatchReason=${result.mismatchReason}`);
}

// 8. Confirm the final state -- both Legs must be Broadcast, each with a real broadcastReference (Sandbox).
const finalState = await client.signingRequests.get(created.signingRequestId);
for (const leg of finalState.legs) {
  console.log(`leg=${leg.role} status=${leg.status} broadcastReference=${leg.broadcastReference}`);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
