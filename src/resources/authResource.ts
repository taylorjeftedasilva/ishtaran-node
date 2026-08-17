import { ResourceSupport } from './resourceSupport.js';
import { HttpTransport, postRequest } from '../http/types.js';
import { BearerTokenHolder } from '../auth/bearerTokenHolder.js';
import { TokenResult, SignUpResponse, mapTokenResult, mapSignUpResponse } from '../model/controlPlane.js';

/**
 * Control Plane — `/v1/auth/*` (5 rotas reais). {@link login} preenche automaticamente o
 * {@link BearerTokenHolder} do client, usado por `AuthenticatingTransport` em toda chamada
 * subsequente de Control Plane — o consumidor nunca precisa repassar o token manualmente.
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

  async signUp(organizationName: string, email: string, password: string): Promise<SignUpResponse> {
    const body = this.toJson({ organizationName, email, password });
    const result = await this.execute(postRequest('/v1/auth/signup', body, false), mapSignUpResponse);
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

  /** Sem chamada HTTP — permite limpar a sessão local do client. */
  logout(): void {
    this.bearerTokenHolder.clear();
  }
}
