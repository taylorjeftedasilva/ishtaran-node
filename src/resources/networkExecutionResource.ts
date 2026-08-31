import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, postRequest } from '../http/types.js';
import {
  NetworkExecutionOperationInput,
  NetworkExecutionQuoteResponse,
  mapNetworkExecutionQuoteResponse,
} from '../model/executionCustody.js';
import { EnumValue } from '../model/enumFactory.js';

/**
 * Data Plane -- `ExecutionCustody` Network Execution Engine (SPEC-NETEXEC-001). A quote is a
 * priced, time-boxed plan for 1..N physical on-chain operations; it never writes anything by
 * itself (Settlement/Withdrawal/Payout each get/re-get their own quote internally at execution
 * time -- `preview quote != execution quote`, never reuse this response as a price guarantee).
 */
export class NetworkExecutionResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  quote(
    environmentId: string,
    assetNetworkId: string,
    operations: NetworkExecutionOperationInput[] | null,
    networkCostPayer: EnumValue<number>,
  ): Promise<NetworkExecutionQuoteResponse> {
    const body = this.toJson({
      assetNetworkId,
      operations: operations === null
        ? null
        : operations.map((op) => ({
          destinationAddress: op.destinationAddress,
          amount: Number(op.amount),
          kind: op.kind.rawValue,
          reference: op.reference,
        })),
      networkCostPayer: networkCostPayer.rawValue,
    });
    return this.execute(
      postRequest(`/v1/environments/${environmentId}/network-execution-quote`, body, true),
      mapNetworkExecutionQuoteResponse,
    );
  }
}
