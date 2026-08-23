import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import {
  SandboxBroadcastAttemptResponse,
  SandboxBroadcastAttemptResult,
  SandboxObservedAddressResponse,
  SandboxObservedAddressResult,
  SandboxTreasuryObservedBalanceResponse,
  mapSandboxBroadcastAttemptResponse,
  mapSandboxBroadcastAttemptResult,
  mapSandboxObservedAddressResponse,
  mapSandboxObservedAddressResult,
  mapSandboxTreasuryObservedBalanceResponse,
} from '../model/sandbox.js';
import { EnumValue } from '../model/enumFactory.js';

/**
 * Data Plane, exclusive to `Environment`s of type Sandbox -- `Sandbox` (9 real routes). Never
 * available/valid against Production (the backend itself rejects it with 422 if the Environment
 * isn't Sandbox).
 */
export class SandboxResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  faucet(environmentId: string, depositAddress: string, assetNetworkId: string, amount: string): Promise<SandboxObservedAddressResult> {
    const body = this.toJson({ depositAddress, assetNetworkId, amount: Number(amount) });
    return this.execute(postRequest(`/v1/environments/${environmentId}/sandbox/faucet`, body, false), mapSandboxObservedAddressResult);
  }

  simulateDeposit(environmentId: string, depositAddress: string, assetNetworkId: string, amount: string): Promise<SandboxObservedAddressResult> {
    const body = this.toJson({ depositAddress, assetNetworkId, amount: Number(amount) });
    return this.execute(postRequest(`/v1/environments/${environmentId}/sandbox/simulate-deposit`, body, false), mapSandboxObservedAddressResult);
  }

  simulateConfirmation(environmentId: string, sandboxObservedAddressId: string, additionalConfirmations: number, isFinal: boolean): Promise<void> {
    const body = this.toJson({ sandboxObservedAddressId, additionalConfirmations, isFinal });
    return this.executeNoContent(postRequest(`/v1/environments/${environmentId}/sandbox/simulate-confirmation`, body, false));
  }

  simulateBroadcastConfirmation(environmentId: string, broadcastAttemptId: string, additionalConfirmations: number, isFinal: boolean): Promise<void> {
    const body = this.toJson({ broadcastAttemptId, additionalConfirmations, isFinal });
    return this.executeNoContent(postRequest(`/v1/environments/${environmentId}/sandbox/simulate-broadcast-confirmation`, body, false));
  }

  simulateWithdrawal(
    environmentId: string,
    destinationAddress: string,
    amount: string,
    assetNetworkId: string,
    outcome: EnumValue<number>,
    failureReason: string | undefined,
  ): Promise<SandboxBroadcastAttemptResult> {
    const body = this.toJson({ destinationAddress, amount: Number(amount), assetNetworkId, outcome: outcome.rawValue, failureReason: failureReason ?? null });
    return this.execute(postRequest(`/v1/environments/${environmentId}/sandbox/simulate-withdrawal`, body, false), mapSandboxBroadcastAttemptResult);
  }

  setObservedTreasuryBalance(environmentId: string, assetNetworkId: string, balance: string): Promise<void> {
    const body = this.toJson({ assetNetworkId, balance: Number(balance) });
    return this.executeNoContent(postRequest(`/v1/environments/${environmentId}/sandbox/treasury-balance`, body, false));
  }

  getTreasuryBalance(environmentId: string, assetNetworkId: string): Promise<SandboxTreasuryObservedBalanceResponse> {
    return this.execute(
      getRequest(`/v1/environments/${environmentId}/sandbox/treasury-balance/${assetNetworkId}`),
      mapSandboxTreasuryObservedBalanceResponse,
    );
  }

  getObservedAddress(environmentId: string, id: string): Promise<SandboxObservedAddressResponse> {
    return this.execute(getRequest(`/v1/environments/${environmentId}/sandbox/observed-addresses/${id}`), mapSandboxObservedAddressResponse);
  }

  getBroadcastAttempt(environmentId: string, id: string): Promise<SandboxBroadcastAttemptResponse> {
    return this.execute(getRequest(`/v1/environments/${environmentId}/sandbox/broadcast-attempts/${id}`), mapSandboxBroadcastAttemptResponse);
  }
}
