import { Environment } from './environment.js';

/**
 * Centralized base URLs -- never URL strings scattered across the SDK. {@link LOCAL_BASE_URL} is
 * the only real known default today (local docker-compose). Sandbox/Production don't have real
 * DNS provisioned yet (terraform apply has never run -- see SDK_CAPABILITY_SPEC.md §2): resolving
 * either of those without an explicit `baseUrl` is a configuration error, never an invented
 * silent fallback.
 */
export const LOCAL_BASE_URL = 'http://localhost:8080';

export function resolveBaseUrl(environment: Environment, explicitBaseUrl: string | undefined): string {
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }
  if (environment === Environment.Local) {
    return LOCAL_BASE_URL;
  }
  throw new Error(
    `An explicit baseUrl is required for Environment.${environment} -- no real Sandbox/Production ` +
      'URL has been provisioned yet (see SDK_CAPABILITY_SPEC.md §2). Configure ' +
      'IshtaranClientConfig.baseUrl explicitly.',
  );
}
