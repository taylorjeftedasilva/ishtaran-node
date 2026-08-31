import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, postRequest } from '../http/types.js';
import { RegisterNetworkCostPayerAccountResult, mapRegisterNetworkCostPayerAccountResult } from '../model/executionCustody.js';

/**
 * Data Plane -- `ExecutionCustody` NetworkCostPayerAccounts (SPEC-NETEXEC-001). Registers the
 * Account debited for the *charged* network cost of a NetworkExecutionQuote (`totalCharged`, in
 * `quoteCurrency`). `accountId` must belong to the caller's own Organization -- a cross-tenant
 * Account is rejected. First-registration-wins per (organizationId, assetNetworkId).
 */
export class NetworkCostPayerAccountsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  register(organizationId: string, assetNetworkId: string, accountId: string): Promise<RegisterNetworkCostPayerAccountResult> {
    const body = this.toJson({ assetNetworkId, accountId });
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/network-cost-payer-accounts`, body, false),
      mapRegisterNetworkCostPayerAccountResult,
    );
  }
}
