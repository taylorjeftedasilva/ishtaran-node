import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, getRequest, postRequest } from '../http/types.js';
import { BearerTokenHolder } from '../auth/bearerTokenHolder.js';
import {
  AccountHolderResponse,
  AccountHolderTokenResult,
  ClaimAccountHolderInvitationResult,
  SignUpAndClaimAccountHolderInvitationResult,
  mapAccountHolderResponse,
  mapAccountHolderTokenResult,
  mapClaimAccountHolderInvitationResult,
  mapSignUpAndClaimAccountHolderInvitationResult,
} from '../model/accountHolders.js';

/**
 * DEC-032 -- self-service, global `AccountHolder` identity (`/v1/account-holders/*`),
 * authenticated via `AccountHolderJwtScheme` -- its own key/token, **never** shared with
 * `AuthResource`'s `BearerTokenHolder` (Member) nor with the Organization's `X-Api-Key`. This
 * resource is built on its own transport (see `client.ts`), precisely so the two tokens never
 * mix within the same client instance.
 */
export class AccountHoldersResource extends ResourceSupport {
  constructor(transport: HttpTransport, private readonly accountHolderTokenHolder: BearerTokenHolder) {
    super(transport);
  }

  async signUp(email: string, password: string): Promise<AccountHolderTokenResult> {
    const body = this.toJson({ email, password });
    const result = await this.execute(postRequest('/v1/account-holders/signup', body, false), mapAccountHolderTokenResult);
    if (result.success && result.accessToken) {
      this.accountHolderTokenHolder.set(result.accessToken);
    }
    return result;
  }

  async login(email: string, password: string): Promise<AccountHolderTokenResult> {
    const body = this.toJson({ email, password });
    const result = await this.execute(postRequest('/v1/account-holders/login', body, false), mapAccountHolderTokenResult);
    if (result.success && result.accessToken) {
      this.accountHolderTokenHolder.set(result.accessToken);
    }
    return result;
  }

  /** Requires an active AccountHolder session (`signUp`/`login` already called on this client instance, or {@link setAccessToken}). */
  me(): Promise<AccountHolderResponse> {
    return this.execute(getRequest('/v1/account-holders/me'), mapAccountHolderResponse);
  }

  /** Requires an active AccountHolder session -- claims an invitation from a NEW Organization for the already-authenticated identity (BR-HLD-006, reuses the existing Account, never duplicates it). */
  claimInvitation(plainTextToken: string): Promise<ClaimAccountHolderInvitationResult> {
    const body = this.toJson({ plainTextToken });
    return this.execute(postRequest('/v1/account-holders/invitations/claim', body, false), mapClaimAccountHolderInvitationResult);
  }

  /** No prior authentication -- creates the identity and claims the invitation atomically (holder never seen before). */
  async signUpAndClaimInvitation(
    plainTextToken: string,
    email: string,
    password: string,
  ): Promise<SignUpAndClaimAccountHolderInvitationResult> {
    const body = this.toJson({ plainTextToken, email, password });
    const result = await this.execute(
      postRequest('/v1/account-holders/invitations/signup-and-claim', body, false),
      mapSignUpAndClaimAccountHolderInvitationResult,
    );
    if (result.success && result.token?.accessToken) {
      this.accountHolderTokenHolder.set(result.token.accessToken);
    }
    return result;
  }

  /** Fills in the session manually (e.g. a token obtained in a previous process) -- never needs to call `signUp`/`login` again on this instance. */
  setAccessToken(accessToken: string): void {
    this.accountHolderTokenHolder.set(accessToken);
  }

  /** No HTTP call -- clears the local AccountHolder session (never affects the Organization's Member/API Key session). */
  logout(): void {
    this.accountHolderTokenHolder.clear();
  }
}
