// 12 -- Invite an AccountHolder to link with an Organization, and claim the invitation from the
// holder's side (DEC-032). Two "personas" in the same process purely for illustration -- in real
// life, the `plainTextToken` goes out over a separate channel (email/link) and it's the holder
// themself who calls `signUpAndClaimInvitation`, never the Organization on their behalf.
import { IshtaranClient, Environment } from '@ishtaran/sdk';

const client = IshtaranClient.create({ apiKey: process.env.ISHTARAN_API_KEY, environment: Environment.Local });
const organizationId = process.env.ISHTARAN_ORGANIZATION_ID!;

// Organization side: issues the invitation. `plainTextToken` only exists in this response --
// treat it as a secret, deliver it to the holder outside the API (never log/persist it in plain text).
const invitation = await client.accounts.createAccountHolderInvitation(organizationId, 'customer-example-012');
console.log('Invitation issued:', invitation.invitationId, 'expires at', invitation.expiresAt);

// Holder (AccountHolder) side: never seen before, creates the identity and claims the
// invitation atomically. No prior authentication -- the invitation token itself is proof of possession.
const claim = await client.accountHolders.signUpAndClaimInvitation(
  invitation.plainTextToken,
  'holder-example-012@example.com',
  'Str0ngP@ssw0rd!',
);

if (!claim.success) {
  throw new Error(`Failed to claim invitation: ${claim.errorCode}`);
}
console.log('Relationship created:', claim.relationshipId);

// The AccessToken returned (via signUpAndClaimInvitation) already populated this client's
// AccountHolder session -- `me()` works immediately, no need to call `login()` again.
const me = await client.accountHolders.me();
console.log('AccountHolder:', me.accountHolderId, 'account=', me.accountId, 'email=', me.email);
