import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, postRequest, withHeader } from '../http/types.js';
import { BearerTokenHolder } from '../auth/bearerTokenHolder.js';
import { resolveIdempotencyKey } from '../idempotency/idempotencyKeyGenerator.js';
import { TokenResult, SignUpResponse, mapTokenResult, mapSignUpResponse } from '../model/controlPlane.js';

/**
 * Control Plane -- `/v1/auth/*` (5 real routes). {@link login} automatically fills the client's
 * {@link BearerTokenHolder}, used by `AuthenticatingTransport` on every subsequent Control Plane
 * call -- the caller never has to pass the token manually.
 */
export class AuthResource extends ResourceSupport {
  constructor(transport: HttpTransport, private readonly bearerTokenHolder: BearerTokenHolder) {
    super(transport);
  }

  async login(email: string, password: string): Promise<TokenResult> {
    const body = this.toJson({ email, password });
    const result = await this.execute(postRequest('/v1/auth/login', body, false), mapTokenResult);
    if (result.success && result.accessToken) {
      this.bearerTokenHolder.set(result.accessToken);
    }
    return result;
  }

  /**
   * `POST /v1/auth/signup` requires an `Idempotency-Key` header (400 `IDEMPOTENCY_KEY_REQUIRED`
   * otherwise, real backend behavior -- `CompositionRoot.EndpointMapping.SignUpEndpoints`).
   * Auto-generated when `idempotencyKey` is omitted, same convention as
   * `OrganizationsResource.create`.
   */
  async signUp(organizationName: string, email: string, password: string, idempotencyKey?: string): Promise<SignUpResponse> {
    const body = this.toJson({ organizationName, email, password });
    const request = withHeader(
      postRequest('/v1/auth/signup', body, false),
      'Idempotency-Key',
      resolveIdempotencyKey(idempotencyKey),
    );
    const result = await this.execute(request, mapSignUpResponse);
    if (result.token.success && result.token.accessToken) {
      this.bearerTokenHolder.set(result.token.accessToken);
    }
    return result;
  }

  async refresh(refreshToken: string): Promise<TokenResult> {
    const body = this.toJson({ refreshToken });
    const result = await this.execute(postRequest('/v1/auth/refresh', body, false), mapTokenResult);
    if (result.success && result.accessToken) {
      this.bearerTokenHolder.set(result.accessToken);
    }
    return result;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.executeNoContent(postRequest('/v1/auth/password-reset/request', this.toJson({ email }), false));
  }

  async confirmPasswordReset(resetToken: string, newPassword: string): Promise<void> {
    await this.executeNoContent(
      postRequest('/v1/auth/password-reset/confirm', this.toJson({ resetToken, newPassword }), false),
    );
  }

  /** No HTTP call -- lets the caller clear the client's local session. */
  logout(): void {
    this.bearerTokenHolder.clear();
  }
}
