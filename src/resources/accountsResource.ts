import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, deleteRequest, getRequest, postRequest } from '../http/types.js';
import {
  AccountResponse,
  CreateAccountResult,
  mapAccountResponse,
  mapCreateAccountResult,
} from '../model/dataPlane.js';
import {
  CreateAccountHolderInvitationResult,
  OrganizationAccountResponse,
  mapCreateAccountHolderInvitationResult,
  mapOrganizationAccountResponse,
} from '../model/accountHolders.js';

/** Data Plane -- `Accounts` (9 real routes, DEC-032). */
export class AccountsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  create(organizationId: string, externalId: string): Promise<CreateAccountResult> {
    const body = this.toJson({ externalId });
    return this.execute(postRequest(`/v1/organizations/${organizationId}/accounts`, body, false), mapCreateAccountResult);
  }

  /** Returns this Organization's link (Relationship) to each Account -- never the standalone Account (DEC-032). */
  list(organizationId: string): Promise<OrganizationAccountResponse[]> {
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/accounts`), mapOrganizationAccountResponse);
  }

  get(accountId: string): Promise<AccountResponse> {
    return this.execute(getRequest(`/v1/accounts/${accountId}`), mapAccountResponse);
  }

  /**
   * DEC-032 -- route nested under `organizationId` (formerly `/v1/accounts/{accountId}/authorize-application`):
   * the backend revalidates the Relationship (organizationId, Account.AccountHolderId)
   * internally, the nested route just simplifies resolving the caller's ownership.
   */
  authorizeApplication(organizationId: string, accountId: string, applicationId: string): Promise<void> {
    const body = this.toJson({ applicationId });
    return this.executeNoContent(
      postRequest(`/v1/organizations/${organizationId}/accounts/${accountId}/authorize-application`, body, false),
    );
  }

  freeze(accountId: string, reason?: string): Promise<void> {
    const body = this.toJson({ reason: reason ?? '' });
    return this.executeNoContent(postRequest(`/v1/accounts/${accountId}/freeze`, body, false));
  }

  unfreeze(accountId: string): Promise<void> {
    return this.executeNoContent(postRequest(`/v1/accounts/${accountId}/unfreeze`, undefined, false));
  }

  close(accountId: string): Promise<void> {
    return this.executeNoContent(deleteRequest(`/v1/accounts/${accountId}`));
  }

  /**
   * DEC-032/BR-HLD-005 -- issues an invitation for an AccountHolder to link with this
   * Organization. `plainTextToken` only exists in this response, once -- treat it as a secret
   * (never log it, deliver it to the holder over a secure channel outside the API).
   */
  createAccountHolderInvitation(organizationId: string, externalId?: string): Promise<CreateAccountHolderInvitationResult> {
    const body = this.toJson({ externalId: externalId ?? null });
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/account-holder-invitations`, body, false),
      mapCreateAccountHolderInvitationResult,
    );
  }

  /** DEC-032/BR-ACC-008 -- never deletes the AccountHolder/Account, only removes this Organization's authorization. */
  revokeRelationship(organizationId: string, relationshipId: string): Promise<void> {
    return this.executeNoContent(
      postRequest(`/v1/organizations/${organizationId}/relationships/${relationshipId}/revoke`, undefined, false),
    );
  }
}
