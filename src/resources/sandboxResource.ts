import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import {
  SandboxBroadcastAttemptResponse,
  SandboxBroadcastAttemptResult,
  SandboxObservedAddressResponse,
  SandboxObservedAddressResult,
  SandboxTreasuryObservedBalanceResponse,
  SandboxWalletBalanceResponse,
  SandboxWalletTransferResponse,
  mapSandboxBroadcastAttemptResponse,
  mapSandboxBroadcastAttemptResult,
  mapSandboxObservedAddressResponse,
  mapSandboxObservedAddressResult,
  mapSandboxTreasuryObservedBalanceResponse,
  mapSandboxWalletBalanceResponse,
  mapSandboxWalletTransferResponse,
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

  /**
   * "Simular depósito" -- persistent, cumulative test-USDT balance credited to a self-custody
   * wallet address, standing in for a real external deposit (an exchange/wallet sending funds in).
   * Never writes to the Ishtaran Ledger. `idempotencyKey` is required -- a retry with the same key
   * never credits twice.
   */
  creditWalletBalance(environmentId: string, address: string, assetNetworkId: string, amount: string, idempotencyKey: string): Promise<SandboxWalletBalanceResponse> {
    const body = this.toJson({ address, assetNetworkId, amount: Number(amount), idempotencyKey });
    return this.execute(postRequest(`/v1/environments/${environmentId}/sandbox/wallet-balance/credit`, body, false), mapSandboxWalletBalanceResponse);
  }

  /**
   * Sandbox analogue of a real self-custody wallet-to-wallet on-chain transfer -- debits
   * `fromAddress` and credits `toAddress` atomically. Entirely outside Ishtaran's business domain
   * (never a Transaction/PaymentIntent/Settlement). Throws with code `INSUFFICIENT_SANDBOX_WALLET_BALANCE`
   * if `fromAddress` doesn't have enough. `idempotencyKey` is required -- a retry never debits twice.
   */
  transferWalletBalance(
    environmentId: string, fromAddress: string, toAddress: string, assetNetworkId: string, amount: string, idempotencyKey: string,
  ): Promise<SandboxWalletTransferResponse> {
    const body = this.toJson({ fromAddress, toAddress, assetNetworkId, amount: Number(amount), idempotencyKey });
    return this.execute(postRequest(`/v1/environments/${environmentId}/sandbox/wallet-balance/transfer`, body, false), mapSandboxWalletTransferResponse);
  }

  /** Never throws NotFound -- an address never credited simply has Balance="0" (same semantics as a real, never-funded on-chain address). */
  getWalletBalance(environmentId: string, assetNetworkId: string, address: string): Promise<SandboxWalletBalanceResponse> {
    const query = new URLSearchParams({ assetNetworkId, address }).toString();
    return this.execute(getRequest(`/v1/environments/${environmentId}/sandbox/wallet-balance?${query}`), mapSandboxWalletBalanceResponse);
  }
}
