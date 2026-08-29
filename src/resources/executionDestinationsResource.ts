import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, postRequest } from '../http/types.js';
import { RegisterExecutionDestinationResult, mapRegisterExecutionDestinationResult } from '../model/executionCustody.js';

/**
 * Data Plane -- `ExecutionCustody` ExecutionDestinations (DEC-037, CUSTODY-EXECUTION-MODES.md).
 * Registers the on-chain address a beneficiary Account actually receives funds at, for a given
 * AssetNetwork -- required before a Settlement involving that Account can execute under
 * SelfCustody (the backend fails fast, before Signing/Broadcast, if none is registered).
 */
export class ExecutionDestinationsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  register(organizationId: string, accountId: string, assetNetworkId: string, address: string): Promise<RegisterExecutionDestinationResult> {
    const body = this.toJson({ accountId, assetNetworkId, address });
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/execution-destinations`, body, false),
      mapRegisterExecutionDestinationResult,
    );
  }
}
