import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, patchRequest, postRequest } from '../http/types.js';
import { RegisterNetworkCostPayerAccountResult, mapRegisterNetworkCostPayerAccountResult } from '../model/executionCustody.js';
import { EnumValue } from '../model/enumFactory.js';

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

  /**
   * F.18 -- switches this Organization's Network Execution mode for `assetNetworkId` between
   * `SELF` (CUSTOMER_RESOURCES, the integrator's own on-chain resources) and `ISHTARAN_SPONSORED`
   * (the default). `allowFallbackToIshtaranResources` only matters when `resourcePreference` is
   * `SELF` -- it decides whether an insufficient CUSTOMER_RESOURCES balance falls back to
   * ISHTARAN_RESOURCES instead of failing closed. Requires a NetworkCostPayerAccount already
   * registered for this (organizationId, assetNetworkId) pair via {@link register}.
   */
  updateResourcePreference(
    organizationId: string,
    assetNetworkId: string,
    resourcePreference: EnumValue<number>,
    allowFallbackToIshtaranResources: boolean,
  ): Promise<void> {
    const body = this.toJson({ resourcePreference: resourcePreference.rawValue, allowFallbackToIshtaranResources });
    return this.executeNoContent(
      patchRequest(`/v1/organizations/${organizationId}/network-cost-payer-accounts/${assetNetworkId}/resource-preference`, body),
    );
  }
}
