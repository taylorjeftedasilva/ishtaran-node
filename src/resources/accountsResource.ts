import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, deleteRequest, getRequest, postRequest } from '../http/types.js';
import {
  AccountResponse,
  CreateAccountResult,
  mapAccountResponse,
  mapCreateAccountResult,
} from '../model/dataPlane.js';

/** Data Plane — `Accounts` (7 rotas reais). */
export class AccountsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  create(organizationId: string, externalId: string): Promise<CreateAccountResult> {
    const body = this.toJson({ externalId });
    return this.execute(postRequest(`/v1/organizations/${organizationId}/accounts`, body, false), mapCreateAccountResult);
  }

  list(organizationId: string): Promise<AccountResponse[]> {
    return this.executeList(getRequest(`/v1/organizations/${organizationId}/accounts`), mapAccountResponse);
  }

  get(accountId: string): Promise<AccountResponse> {
    return this.execute(getRequest(`/v1/accounts/${accountId}`), mapAccountResponse);
  }

  authorizeApplication(accountId: string, applicationId: string): Promise<void> {
    const body = this.toJson({ applicationId });
    return this.executeNoContent(postRequest(`/v1/accounts/${accountId}/authorize-application`, body, false));
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
}
