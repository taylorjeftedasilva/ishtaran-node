/**
 * Holds the Member access token (after `auth.login(...)`) -- mutable within an `IshtaranClient`
 * instance. Never logs the token.
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
