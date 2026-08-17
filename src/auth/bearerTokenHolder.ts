/**
 * Guarda o access token de Member (após `auth.login(...)`) — mutável dentro de uma instância de
 * `IshtaranClient`. Nunca loga o token.
 */
export class BearerTokenHolder {
  private token: string | undefined;

  set(token: string): void {
    this.token = token;
  }

  current(): string | undefined {
    return this.token;
  }

  clear(): void {
    this.token = undefined;
  }
}
