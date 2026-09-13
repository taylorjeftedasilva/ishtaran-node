import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import { EnumValue } from '../model/enumFactory.js';
import {
  AllocatedDepositAddressResult,
  RegisterWalletResult,
  WalletPublicMaterialResult,
  WalletResponse,
  mapAllocatedDepositAddressResult,
  mapRegisterWalletResult,
  mapWalletPublicMaterialResult,
  mapWalletResponse,
} from '../model/executionCustody.js';

/**
 * Data Plane -- `ExecutionCustody` Wallets (SPEC-018/021, checkpoint 8). The SDK only ever sends
 * the PUBLIC extended key (`publicDerivationMaterial`) -- generated locally by
 * `wallet/walletFactory.js`, never the private key/mnemonic (INV-SC-01).
 */
export class WalletsResource extends ResourceSupport {
  constructor(transport: HttpTransport) {
    super(transport);
  }

  register(
    applicationId: string,
    networkId: string,
    scheme: EnumValue<number>,
    publicDerivationMaterial: string,
    idempotencyKey?: string,
  ): Promise<RegisterWalletResult> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({ networkId, scheme: scheme.rawValue, publicDerivationMaterial, idempotencyKey: key });
    return this.execute(postRequest(`/v1/applications/${applicationId}/wallets`, body, true), mapRegisterWalletResult);
  }

  /**
   * BR-TRF-008 -- registers the execution/signing identity OWNED by a specific Account (its own
   * `publicDerivationMaterial`, generated independently client-side -- never the same material as
   * the Application's shared {@link register} Wallet). Required before that Account can be the
   * `sourceAccountId` of a `transfers.request(...)` call for this `networkId`. Index 0 is reserved
   * automatically as this Account's own receiving address (no separate `allocateDepositAddress`
   * call needed for it).
   */
  registerForAccount(
    organizationId: string,
    accountId: string,
    applicationId: string,
    networkId: string,
    scheme: EnumValue<number>,
    publicDerivationMaterial: string,
    idempotencyKey?: string,
  ): Promise<RegisterWalletResult> {
    const key = resolveIdempotencyKey(idempotencyKey);
    const body = this.toJson({ applicationId, networkId, scheme: scheme.rawValue, publicDerivationMaterial, idempotencyKey: key });
    return this.execute(
      postRequest(`/v1/organizations/${organizationId}/accounts/${accountId}/wallets`, body, true),
      mapRegisterWalletResult,
    );
  }

  /** BR-WLT-002 -- never includes `publicDerivationMaterial`; see {@link getPublicMaterial}. */
  get(walletId: string): Promise<WalletResponse> {
    return this.execute(getRequest(`/v1/wallets/${walletId}`), mapWalletResponse);
  }

  getPublicMaterial(walletId: string): Promise<WalletPublicMaterialResult> {
    return this.execute(getRequest(`/v1/wallets/${walletId}/public-material`), mapWalletPublicMaterialResult);
  }

  /** SPEC-018 §BR-WLT-001 -- each call allocates a NEW index by design, no `idempotencyKey`; never retry-reuse it automatically. */
  allocateDepositAddress(applicationId: string, networkId: string): Promise<AllocatedDepositAddressResult> {
    const body = this.toJson({ networkId });
    return this.execute(
      postRequest(`/v1/applications/${applicationId}/wallets/deposit-addresses`, body, false),
      mapAllocatedDepositAddressResult,
    );
  }
}
