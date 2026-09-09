import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, postRequest } from '../http/types.js';
import { RegisterExecutionSourceResult, mapRegisterExecutionSourceResult } from '../model/executionCustody.js';

/**
 * Data Plane -- `ExecutionCustody` ExecutionSources (CUSTODY-EXECUTION-MODES.md, SPEC-ADDRESSPOOL-001).
 * Registers the address ExecutionCustody signs FROM to pay network cost for a given AssetNetwork --
 * required, together with a {@link NetworkCostPayerAccountsResource}, before the first self-custody
 * Withdrawal/Payout on that AssetNetwork (the backend fails fast if none is registered).
 */
export class ExecutionSourcesResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  register(
    organizationId: string,
    environmentId: string,
    assetNetworkId: string,
    walletId: string,
    derivationReference: number,
    address: string | null,
  ): Promise<RegisterExecutionSourceResult> {
    const body = this.toJson({ environmentId, assetNetworkId, walletId, derivationReference, address });
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/execution-sources`, body, false),
      mapRegisterExecutionSourceResult,
    );
  }

  /**
   * F.18 -- self-reported (no on-chain verification in this version) declaration of the on-chain
   * resource capacity available to the Wallet backing this ExecutionSource. Required before
   * CUSTOMER_RESOURCES (`SELF`) mode can ever succeed for it -- the platform checks this declared
   * stake for sufficiency at quote time. Safe to call again any time to re-sync (no
   * first-registration-wins restriction, unlike {@link register}).
   */
  syncResourceStake(
    organizationId: string,
    executionSourceId: string,
    availableNativeAmount: string,
    availableEnergy: string,
    availableBandwidth: string,
  ): Promise<void> {
    const body = this.toJson({
      availableNativeAmount: Number(availableNativeAmount),
      availableEnergy: Number(availableEnergy),
      availableBandwidth: Number(availableBandwidth),
    });
    return this.executeNoContent(
      postRequest(`/v1/organizations/${organizationId}/execution-sources/${executionSourceId}/resource-stake`, body, false),
    );
  }
}
